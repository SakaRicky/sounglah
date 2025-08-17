from flask import Blueprint, jsonify, request, current_app
from threading import Thread
import traceback
from uuid import uuid4
from datetime import datetime, timezone
from my_app import db
from my_app.models import AugmentationRun
from my_app.pipeline.run_pipeline import run_once

augment_bp = Blueprint("augment", __name__)

def _job(app, run_id, user_id):
    # IMPORTANT: push an app context in background threads
    with app.app_context():
        try:
            run = db.session.get(AugmentationRun, run_id)
            run.status = 'running'
            run.started_at = datetime.now(timezone.utc)
            db.session.commit()

            result = run_once(db.session, str(run_id), sample_size=50)

            run.status = 'succeeded'
            run.finished_at = datetime.now(timezone.utc)
            run.runtime_seconds = result["runtime_s"]
            run.metrics = result["counts"]
            run.artifact_path = result["artifact_path"]
            db.session.commit()
        except Exception:
            db.session.rollback()
            run = db.session.get(AugmentationRun, run_id)
            if run:
                run.status = 'failed'
                run.finished_at = datetime.now(timezone.utc)
                run.error = traceback.format_exc()[:4000]
                db.session.commit()

@augment_bp.post("/admin/augment")
def start_augment():
    body = request.get_json(silent=True) or {}
    sample_mode = bool(body.get("sample", True))        # default: sample
    sample_size = int(body.get("sample_size", 50)) if sample_mode else None

    user_id = getattr(getattr(request, "user", None), "id", None)
    run = AugmentationRun(status='queued', triggered_by=user_id, created_at=datetime.now(timezone.utc))
    db.session.add(run); db.session.commit()

    def _job(app, run_id, user_id):
        with app.app_context():
            try:
                run = db.session.get(AugmentationRun, run_id)
                run.status = 'running'; run.started_at = datetime.now(timezone.utc)
                db.session.commit()

                result = run_once(db.session, str(run_id), sample_size=sample_size)

                run.status = 'succeeded'
                run.finished_at = datetime.now(timezone.utc)
                run.runtime_seconds = result["runtime_s"]
                run.metrics = result["counts"]
                run.artifact_path = result["artifact_path"]
                db.session.commit()
            except Exception:
                db.session.rollback()
                run = db.session.get(AugmentationRun, run_id)
                if run:
                    run.status = 'failed'
                    run.finished_at = datetime.now(timezone.utc)
                    run.error = traceback.format_exc()[:4000]
                    db.session.commit()

    Thread(target=_job, args=(current_app._get_current_object(), run.id, user_id), daemon=True).start()
    return jsonify({"ok": True, "runId": str(run.id)})

@augment_bp.get("/admin/augment/<run_id>")
def get_run(run_id):
    r = db.session.get(AugmentationRun, run_id)
    if not r:
        return jsonify({"error": "not found"}), 404
    return jsonify({
        "id": str(r.id),
        "status": r.status,
        "metrics": r.metrics,
        "artifact_path": r.artifact_path,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "finished_at": r.finished_at.isoformat() if r.finished_at else None,
        "error": r.error,
    })
