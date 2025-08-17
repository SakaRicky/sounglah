def _ok_len_ratio(src, tgt, low=0.5, high=2.0):
    sl = max(1, len((src or "").split()))
    tl = max(1, len((tgt or "").split()))
    return low <= sl / tl <= high, sl, tl

def run_filter(rows: list[dict], *, len_low=0.5, len_high=2.0, skip_len_check_if_short=2):
    keep, drops, seen = [], [], set()
    stats = {"dropped_empty": 0, "dropped_lenratio": 0, "dropped_dup_exact": 0}

    for r in rows:
        s, t = r.get("source_text") or "", r.get("target_text") or ""
        if not s.strip() or not t.strip():
            stats["dropped_empty"] += 1
            drops.append({**r, "reason": "empty"})
            continue

        sw, tw = len(s.split()), len(t.split())
        ok_len = True
        if sw > skip_len_check_if_short and tw > skip_len_check_if_short:
            ok_len, sl, tl = _ok_len_ratio(s, t, len_low, len_high)
            if not ok_len:
                stats["dropped_lenratio"] += 1
                ratio = round(sl / max(1, tl), 3)
                drops.append({**r, "reason": "lenratio", "ratio": ratio, "src_words": sl, "tgt_words": tl})
                continue

        key = (s, t)
        if key in seen:
            stats["dropped_dup_exact"] += 1
            drops.append({**r, "reason": "dup_exact"})
            continue
        seen.add(key)
        keep.append(r)

    return keep, stats, drops
