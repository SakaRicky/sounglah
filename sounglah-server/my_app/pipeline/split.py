# app/pipeline/split.py
from __future__ import annotations
import json, random
from typing import List, Dict, Tuple

def split_rows(
    rows: List[Dict],
    seed: int = 42,
    frac: Tuple[float, float, float] = (0.8, 0.1, 0.1)
) -> Dict[str, List[Dict]]:
    assert abs(sum(frac) - 1.0) < 1e-6
    rng = random.Random(seed)
    idxs = list(range(len(rows)))
    rng.shuffle(idxs)

    n = len(rows)
    n_train = int(frac[0] * n)
    n_dev   = int(frac[1] * n)
    # put remainder into test
    n_test  = n - n_train - n_dev

    train = [rows[i] for i in idxs[:n_train]]
    dev   = [rows[i] for i in idxs[n_train:n_train+n_dev]]
    test  = [rows[i] for i in idxs[n_train+n_dev:]]
    return {"train": train, "dev": dev, "test": test}
