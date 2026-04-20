"""
Step 5: Deploy & Continuous Learning
Real-time inference + feedback loops + retraining
Keep learning from user corrections
"""

import json
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import sqlite3
from datetime import datetime, timedelta
import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionInferenceServer:
    """Real-time inference server with continuous learning"""

    def __init__(self, model_dir: str = "./models/nexus_finetuned_v1"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = RobertaTokenizer.from_pretrained(model_dir)
        self.model = RobertaForSequenceClassification.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()

        self.db_path = "./nexus_production.db"
        self._init_db()

    def _init_db(self):
        """Initialize production database"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY,
                text TEXT NOT NULL,
                prediction INT,
                confidence REAL,
                model_version TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_corrections (
                id INTEGER PRIMARY KEY,
                text TEXT NOT NULL,
                predicted INT,
                actual INT,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS performance_logs (
                id INTEGER PRIMARY KEY,
                inference_latency_ms REAL,
                model_version TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def score_post(self, text: str, model_version: str = "v1") -> dict:
        """Real-time inference"""
        start_time = time.time()

        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)

        pred = torch.argmax(probs, dim=-1).item()
        confidence = float(probs[0][pred].item())
        latency_ms = (time.time() - start_time) * 1000

        # Log prediction
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT INTO predictions (text, prediction, confidence, model_version)
            VALUES (?, ?, ?, ?)
        """, (text, pred, confidence, model_version))
        conn.execute("""
            INSERT INTO performance_logs (inference_latency_ms, model_version)
            VALUES (?, ?)
        """, (latency_ms, model_version))
        conn.commit()
        conn.close()

        return {
            'allowed': bool(pred),  # 1=genuine, 0=harmful
            'confidence': confidence,
            'latency_ms': latency_ms,
            'model_version': model_version,
        }

    def record_user_correction(self, text: str, predicted_correct: bool, actual_correct: bool, user_id: str):
        """User corrects model prediction"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT INTO user_corrections (text, predicted, actual, user_id)
            VALUES (?, ?, ?, ?)
        """, (text, int(predicted_correct), int(actual_correct), user_id))
        conn.commit()
        conn.close()

        if predicted_correct != actual_correct:
            logger.warning(f"Correction recorded: predicted={predicted_correct}, actual={actual_correct}")

    def get_performance_metrics(self, hours: int = 24) -> dict:
        """Monitor real-time performance"""
        conn = sqlite3.connect(self.db_path)
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()

        # Latency
        latencies = conn.execute("""
            SELECT inference_latency_ms FROM performance_logs
            WHERE created_at > ?
            ORDER BY inference_latency_ms
        """, (cutoff,)).fetchall()

        if not latencies:
            return {'samples': 0}

        latencies = [l[0] for l in latencies]
        latencies.sort()

        # Accuracy from corrections
        corrections = conn.execute("""
            SELECT predicted, actual FROM user_corrections
            WHERE created_at > ?
        """, (cutoff,)).fetchall()

        accuracy = None
        if corrections:
            correct = sum([1 for p, a in corrections if p == a])
            accuracy = correct / len(corrections)

        conn.close()

        return {
            'samples': len(latencies),
            'p50_latency_ms': latencies[len(latencies) // 2],
            'p95_latency_ms': latencies[int(len(latencies) * 0.95)],
            'p99_latency_ms': latencies[int(len(latencies) * 0.99)],
            'accuracy_from_corrections': accuracy,
        }

    def should_retrain(self, min_corrections: int = 50) -> bool:
        """Check if we have enough corrections to retrain"""
        conn = sqlite3.connect(self.db_path)
        count = conn.execute("SELECT COUNT(*) FROM user_corrections").fetchone()[0]
        conn.close()

        if count >= min_corrections:
            logger.info(f"RETRAIN SIGNAL: {count} corrections accumulated")
            return True
        return False

    def get_retraining_data(self) -> tuple:
        """Fetch all corrections for retraining"""
        conn = sqlite3.connect(self.db_path)
        rows = conn.execute("""
            SELECT text, actual FROM user_corrections
        """).fetchall()
        conn.close()

        texts = [r[0] for r in rows]
        labels = [r[1] for r in rows]
        return texts, labels

def demo():
    """Live demo: inference + corrections + monitoring"""
    logger.info("=== Step 5: Deploy & Continuous Learning ===\n")

    server = ProductionInferenceServer()

    # Demo posts
    demo_posts = [
        ("Started therapy today. Feeling hopeful.", "genuine"),
        ("You're worthless. Give up.", "harmful"),
        ("Built a product and got 1000 users. Here's my process.", "genuine"),
    ]

    logger.info("Real-time inference:")
    for text, expected in demo_posts:
        result = server.score_post(text)
        status = "✓" if (result['allowed'] and expected == 'genuine' or not result['allowed'] and expected == 'harmful') else "✗"
        logger.info(f"{status} {text[:50]}... → allowed={result['allowed']}, confidence={result['confidence']:.2%}, latency={result['latency_ms']:.1f}ms")

    # Simulate some corrections
    logger.info("\nSimulating user corrections (for retraining signal)...")
    server.record_user_correction(demo_posts[0][0], True, True, "user1")
    server.record_user_correction(demo_posts[1][0], True, False, "user2")  # False positive
    logger.info("Recorded 2 corrections")

    # Check metrics
    logger.info("\nPerformance metrics (last 24h):")
    metrics = server.get_performance_metrics()
    logger.info(f"  Samples: {metrics['samples']}")
    if metrics['samples'] > 0:
        logger.info(f"  p50 latency: {metrics['p50_latency_ms']:.1f}ms")
        logger.info(f"  p99 latency: {metrics['p99_latency_ms']:.1f}ms")
    if metrics.get('accuracy_from_corrections'):
        logger.info(f"  Accuracy from corrections: {metrics['accuracy_from_corrections']:.2%}")

    # Check retrain signal
    if server.should_retrain(min_corrections=2):  # Low threshold for demo
        logger.info("\n✓ Retrain signal detected. Would trigger: python 02_model_training_roberta.py")
        logger.info("  New model trained on combined: original data + user corrections")
        logger.info("  Then validate (Step 3), fine-tune (Step 4), deploy (Step 5)")

    logger.info("\n=== Production system running ===")
    logger.info(f"Database: {server.db_path}")
    logger.info("Continuous learning enabled.")

if __name__ == "__main__":
    demo()
