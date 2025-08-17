# app/pipeline/filter_lang.py
import regex as re
from langid.langid import LanguageIdentifier, model

# Build a singleton identifier with normalized probabilities in [0,1]
_IDENTIFIER = LanguageIdentifier.from_modelstring(model, norm_probs=True)
# Expect English for now; when you add FR, switch to ["en","fr"]
_IDENTIFIER.set_languages(["en"])

_WORD_RE = re.compile(r"\p{L}+", re.UNICODE)

def _word_count(s: str) -> int:
    return len(_WORD_RE.findall(s or ""))

def _mostly_symbols_or_digits(s: str) -> bool:
    if not s:
        return True
    letters = sum(ch.isalpha() for ch in s)
    return letters / max(1, len(s)) < 0.4

def _detect(text: str):
    # label, prob in [0,1] because norm_probs=True
    label, prob = _IDENTIFIER.classify(text)
    # margin = p1 - p2 (how much the top wins over the runner-up)
    ranks = _IDENTIFIER.rank(text)
    p1 = ranks[0][1] if ranks else float(prob)
    p2 = ranks[1][1] if ranks and len(ranks) > 1 else 0.0
    margin = float(p1 - p2)
    return label, float(prob), margin

def run_filter_lang(
    rows: list[dict],
    *,
    min_prob: float = 0.55,     # top class probability
    min_margin: float = 0.20,   # separation from runner-up
    skip_short_words: int = 3,
    skip_symboly: bool = True
):
    """
    - Skip checking very short/symbolic strings (UI labels etc.).
    - Keep rows when label==expected (even if low confidence), but count them.
    - Drop ONLY when label!=expected AND the detector is confident (prob & margin).
    Returns: (kept_rows, stats, dropped_rows_for_review)
    """
    keep, dropped = [], []
    stats = {"checked": 0, "dropped_lang": 0, "kept_lowconf": 0}

    for r in rows:
        exp = r.get("source_lang")
        text = r.get("source_text") or ""

        # If unknown expected lang, or too short/symbol-heavy → trust metadata
        if exp not in ("en", "fr") or _word_count(text) < skip_short_words or (skip_symboly and _mostly_symbols_or_digits(text)):
            keep.append(r)
            continue

        label, prob, margin = _detect(text)
        stats["checked"] += 1

        if label == exp:
            # Match: keep. Track if it was weak just for visibility.
            if prob < min_prob or margin < min_margin:
                stats["kept_lowconf"] += 1
            keep.append(r)
        else:
            # Mismatch: drop only if confident
            if prob >= min_prob and margin >= min_margin:
                stats["dropped_lang"] += 1
                dropped.append({**r, "detected": label, "prob": prob, "margin": margin})
            else:
                # Uncertain mismatch -> keep (don’t over-filter)
                stats["kept_lowconf"] += 1
                keep.append(r)

    return keep, stats, dropped
