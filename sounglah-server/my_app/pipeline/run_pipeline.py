# app/pipeline/run_pipeline.py
import time
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import aliased
from my_app.models import TranslationPair, Language, PipelineCursor
from .normalize import run_normalize
from .filter_lang import run_filter_lang
from .filter_bad import run_filter           # expects (rows, stats, drops)
from .io_utils import write_jsonl, write_json, ensure_dir
from .filter_near_dup import run_filter_near
from .split import split_rows

# Tunables
LANGID_MIN_PROB = 0.55
LANGID_MIN_MARGIN = 0.20
SKIP_SHORT_WORDS = 3
SKIP_SYMBOLY = True
LEN_RATIO = (0.33, 3.0)
SKIP_LEN_CHECK_IF_SHORT = 3
DUP_NEAR_JACCARD = 0.90
DUP_NEAR_KEY = "source_text"

def run_once(db_session, run_id: str, sample_size: int | None = 50) -> dict:
    t0 = time.time()

    # --- 1) export newly-approved pairs since cursor watermark (ORM)
    cursor = db_session.get(PipelineCursor, 'pipeline_clean')
    if cursor is None:
        cursor = PipelineCursor(job_name='pipeline_clean', last_approved_at=None, last_id=None)
        db_session.add(cursor)
        db_session.commit()

    sl = aliased(Language); tl = aliased(Language)
    stmt = (
        select(
            TranslationPair.id,
            TranslationPair.source_text,
            TranslationPair.target_text,
            sl.iso_code.label("source_lang"),
            tl.iso_code.label("target_lang"),
            TranslationPair.created_at,
            TranslationPair.approved_at,
        )
        .join(sl, TranslationPair.source_lang_id == sl.id)
        .join(tl, TranslationPair.target_lang_id == tl.id)
        .where(TranslationPair.status == 'approved')
        .where(TranslationPair.target_text.is_not(None))
    )
    # incremental condition using (approved_at, id) tuple
    if cursor.last_approved_at is not None:
        stmt = stmt.where(
            or_(
                TranslationPair.approved_at > cursor.last_approved_at,
                and_(
                    TranslationPair.approved_at == cursor.last_approved_at,
                    TranslationPair.id > (cursor.last_id or 0)
                )
            )
        )

    stmt = stmt.order_by(TranslationPair.approved_at.asc(), TranslationPair.id.asc())
    if sample_size and sample_size > 0:
        stmt = stmt.limit(sample_size)

    rows = [dict(r) for r in db_session.execute(stmt).mappings().all()]
    exported = len(rows)

    # --- 2) normalize (safe cleanup)
    rows = run_normalize(rows)

    # --- 3) language-ID filter (drops only confident mismatches)
    rows, lang_stats, lang_drops = run_filter_lang(
        rows,
        min_prob=LANGID_MIN_PROB,
        min_margin=LANGID_MIN_MARGIN,
        skip_short_words=SKIP_SHORT_WORDS,
        skip_symboly=SKIP_SYMBOLY,
    )

    # --- 4) basic quality filters (length ratio, empties, exact dups)
    rows, bad_stats, bad_drops = run_filter(
        rows,
        len_low=LEN_RATIO[0],
        len_high=LEN_RATIO[1],
        skip_len_check_if_short=SKIP_LEN_CHECK_IF_SHORT,
    )
    rows, near_stats, near_drops = run_filter_near(
                                        rows,
                                        key=DUP_NEAR_KEY,
                                        jaccard_threshold=DUP_NEAR_JACCARD,
                                    )

    clean = len(rows)

    # --- 5) save artifacts
    outdir = f"data/processed/{run_id}"
    ensure_dir(outdir)
    artifact_path = write_jsonl(f"{outdir}/pairs.jsonl", rows)

    # drops
    if bad_drops:
        write_jsonl(f"{outdir}/drops_bad.jsonl", bad_drops)
    if near_drops:
        write_jsonl(f"{outdir}/drops_dup_near.jsonl", near_drops)
    if lang_drops:
        write_jsonl(f"{outdir}/drops_lang.jsonl", lang_drops)
    
    # stats summaries for quick viewing
    write_json(f"{outdir}/_stats_bad.json", bad_stats or {})
    write_json(f"{outdir}/_stats_lang.json", lang_stats or {})
    write_json(f"{outdir}/_stats_dup_near.json", near_stats or {})

    # --- 5) split for training
    splits = split_rows(rows, seed=42, frac=(0.8, 0.1, 0.1))
    write_jsonl(f"{outdir}/train.jsonl", splits["train"])
    write_jsonl(f"{outdir}/dev.jsonl",   splits["dev"])
    write_jsonl(f"{outdir}/test.jsonl",  splits["test"])

    counts = {
        "exported": exported,
        **(lang_stats or {}),
        **(bad_stats or {}),
        **(near_stats or {}),
        "clean": len(rows),
        "augmented": 0,
    }

    validation = _validate(rows, counts, splits)
    write_json(f"{outdir}/_validate.json", validation)
    if not validation["ok"]:
        raise AssertionError("Post-run validation failed:\n" + "\n".join(validation["issues"]))

    card = {
        "run_id": run_id,
        "created_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "counts": counts,
        "filters": {
            "langid_min_prob": LANGID_MIN_PROB,
            "langid_min_margin": LANGID_MIN_MARGIN,
            "skip_short_words": SKIP_SHORT_WORDS,
            "skip_len_check_if_short": SKIP_LEN_CHECK_IF_SHORT,
            "len_ratio": list(LEN_RATIO),
            "dup_near_jaccard": DUP_NEAR_JACCARD,
            "dup_near_key": DUP_NEAR_KEY,
        },
        "modes": {"sample_size": sample_size},
        "langs": {
            "source": sorted({r["source_lang"] for r in rows}) if rows else [],
            "target": sorted({r["target_lang"] for r in rows}) if rows else [],
        },
        "notes": "Phase-2: normalize + lang-id + quality filters + near-dup + splits. No augmentation yet.",
        "columns": ["id","source_text","target_text","source_lang","target_lang","created_at"],
        "license": "internal",
        "splits": {
            "counts": {k: len(v) for k, v in splits.items()},
            "seed": 42,
            "frac": [0.8, 0.1, 0.1],
        },
    }
    card_path = write_json(f"{outdir}/_card.json", card)

    # --- 6) advance cursor if we processed any
    if rows:
        last_row = rows[-1]
        cursor.last_approved_at = last_row.get("approved_at")
        cursor.last_id = last_row.get("id")
        from datetime import datetime as _dt
        cursor.updated_at = _dt.utcnow()
        db_session.add(cursor)
        db_session.commit()

    return {
        "counts": counts,
        "artifact_path": artifact_path,
        "runtime_s": round(time.time() - t0, 2),
        "card_path": card_path,
    }

def _validate(rows, counts, splits):
    issues = []

    # math: exported - all drops == clean
    drop_total = sum(v for k, v in counts.items() if k.startswith("dropped_"))
    if counts["exported"] - drop_total != counts["clean"]:
        issues.append(f"Counts mismatch: exported({counts['exported']}) - drops({drop_total}) != clean({counts['clean']})")

    # splits: sum + disjoint
    split_sizes = {k: len(v) for k, v in splits.items()}
    if sum(split_sizes.values()) != len(rows):
        issues.append(f"Splits sum mismatch: {split_sizes} vs clean {len(rows)}")

    keys = list(splits.keys())
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            a = {r["id"] for r in splits[keys[i]]}
            b = {r["id"] for r in splits[keys[j]]}
            overlap = a & b
            if overlap:
                issues.append(f"Split leakage between {keys[i]} and {keys[j]}: {len(overlap)} ids")

    # residual dups after filters (pair-level)
    pair_set = {(r["source_text"], r["target_text"]) for r in rows}
    if len(pair_set) != len(rows):
        issues.append("Residual duplicate (source_text,target_text) pairs detected after filters")

    # optional: near-dup leakage across splits by source_text
    src_sets = {k: {r["source_text"] for r in v} for k, v in splits.items()}
    src_overlap = set()
    ks = list(src_sets.keys())
    for i in range(len(ks)):
        for j in range(i + 1, len(ks)):
            src_overlap |= (src_sets[ks[i]] & src_sets[ks[j]])
    if src_overlap:
        issues.append(f"Source text appears in multiple splits: {len(src_overlap)} overlaps")

    return {"ok": not issues, "issues": issues}
