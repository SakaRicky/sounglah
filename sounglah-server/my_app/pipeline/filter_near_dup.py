# app/pipeline/filter_near_dup.py
from __future__ import annotations
import re
from typing import List, Dict, Tuple

_ws = re.compile(r"\s+")

def _norm(text: str) -> str:
    # keep diacritics; just lowercase & collapse spaces
    return _ws.sub(" ", (text or "").strip().lower())

def _tokset(text: str) -> set[str]:
    return set(_norm(text).split())

def _jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    inter = a & b
    union = a | b
    return len(inter) / len(union)

def run_filter_near(
    rows: List[Dict],
    key: str = "source_text",
    jaccard_threshold: float = 0.9
) -> Tuple[List[Dict], Dict[str, int], List[Dict]]:
    """
    Drops rows whose token-set Jaccard similarity vs. a kept exemplar >= threshold.
    Returns (kept_rows, stats, drops)
    """
    kept: List[Dict] = []
    drops: List[Dict] = []

    exemplars: List[Tuple[set[str], int]] = []  # (tokset, id_of_exemplar)

    for r in rows:
        txt = r.get(key) or ""
        toks = _tokset(txt)
        is_dup = False
        dup_of = None
        for ex_toks, ex_id in exemplars:
            sim = _jaccard(toks, ex_toks)
            if sim >= jaccard_threshold:
                is_dup = True
                dup_of = ex_id
                break
        if is_dup:
            drops.append({
                **r,
                "reason": "dup_near",
                "duplicate_of": dup_of,
                "jaccard": round(_jaccard(toks, [t for t in exemplars if t[1]==dup_of][0][0]), 3)
            })
        else:
            kept.append(r)
            exemplars.append((toks, r.get("id")))
    stats = {"dropped_dup_near": len(drops)}
    return kept, stats, drops
