import unicodedata, regex as re
NBSP = "\u00A0"; ZWS = "\u200B"

APOS_VARIANTS = ["'", "’", "ʼ", "ʹ"]  # keep U+02BC on target (Medumba)

def _to_nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s or "")

def _clean_ws(s: str) -> str:
    s = (s or "").replace(NBSP, " ").replace(ZWS, "")
    return re.sub(r"\s+", " ", s).strip()

def _canonical_apostrophes_med(s: str) -> str:
    for ch in APOS_VARIANTS:
        s = s.replace(ch, "ʼ")  # U+02BC
    return s

def _strip_unbalanced_trailing_quote(s: str) -> str:
    if not s: return s
    t = re.sub("[“”]", '"', re.sub("[‘’]", "'", s))
    if t.count('"') % 2 == 1 and t.rstrip().endswith('"'):
        return re.sub(r'"\s*$', "", s)
    if t.count("'") % 2 == 1 and t.rstrip().endswith("'"):
        return re.sub(r"'\s*$", "", s)
    return s

def normalize_record(r: dict) -> dict:
    # Source: trim + remove stray ending quotes; unify curly quotes to straight
    src = _clean_ws(r["source_text"])
    src = _strip_unbalanced_trailing_quote(src)
    src = src.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    r["source_text"] = src

    # Target (Medumba): NFC + apostrophes canonical + trailing quote check
    tgt = _to_nfc(_clean_ws(r["target_text"]))
    tgt = _canonical_apostrophes_med(tgt)
    tgt = _strip_unbalanced_trailing_quote(tgt)
    r["target_text"] = tgt
    return r

def run_normalize(rows): 
    return [normalize_record(r) for r in rows]
