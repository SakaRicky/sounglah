from transformers import AutoTokenizer
from transformers import AutoModelForSeq2SeqLM
import logging
import os

os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load_models():
    MODELS_DIR = os.path.join(BASE_DIR, "models")
    TOKENIZER_DIR = os.path.join(MODELS_DIR, "opus-mt-en-mul")
    MODEL_DIR = os.path.join(MODELS_DIR, "eng-med")

    logger.info(f"Loading tokenizer from: {TOKENIZER_DIR}")
    logger.info(f"Loading model from: {MODEL_DIR}")

    try:
        tokenizer = AutoTokenizer.from_pretrained(
            TOKENIZER_DIR,
            local_files_only=True
        )
        model = AutoModelForSeq2SeqLM.from_pretrained(
            MODEL_DIR,
            local_files_only=True
        )
        logger.info("Loaded tokenizer and model from cache successfully.")
        return tokenizer, model
    except Exception as e:
        logger.error(f"Local load failure: {e}", exc_info=True)
        return None, None