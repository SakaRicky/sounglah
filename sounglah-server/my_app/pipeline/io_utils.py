# pipeline/io_utils.py
import json, os
from datetime import datetime
from pathlib import Path

def ensure_dir(path: str) -> str:
    Path(path).mkdir(parents=True, exist_ok=True)
    return path

def write_jsonl(path: str, rows: list[dict]) -> str:
    ensure_dir(os.path.dirname(path))
    with open(path, "w", encoding="utf-8") as f:
        def _default(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False, default=_default) + "\n")
    return path

def write_json(path: str, obj) -> str:
    ensure_dir(os.path.dirname(path))
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    return path