"""
Monitoring: detect data drift, model drift, performance degradation
Feedback loops: collect user corrections, retrain
"""

import json
from datetime import datetime, timedelta
import sqlite3
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class DataDriftDetector:
    """Monitor input data distribution changes"""
    def __init__(self, db_path: str = "./feature_store.db"):
        self.db_path = db_path

    def get_stats(self, hours: int = 24) -> Dict:
        """Get stats for last N hours"""
        conn = sqlite3.connect(self.db_path)
        cutoff = datetime.now() - timedelta(hours=hours)
        rows = conn.execute("""
            SELECT therapeutic_score, harmful_score
            FROM features
            WHERE created_at > ?
        """, (cutoff.isoformat(),)).fetchall()
        conn.close()

        if not rows:
            return {'samples': 0}

        therapeutic = [r[0] for r in rows]
        harmful = [r[1] for r in rows]

        return {
            'samples': len(therapeutic),
            'therapeutic_mean': sum(therapeutic) / len(therapeutic),
            'therapeutic_std': (sum([(x - sum(therapeutic)/len(therapeutic))**2 for x in therapeutic]) / len(therapeutic)) ** 0.5,
            'harmful_mean': sum(harmful) / len(harmful),
            'harmful_std': (sum([(x - sum(harmful)/len(harmful))**2 for x in harmful]) / len(harmful)) ** 0.5,
        }

    def detect_drift(self, baseline: Dict, current: Dict, threshold: float = 0.2) -> bool:
        """Compare baseline to current. Threshold = % change"""
        if current['samples'] < 10:
            return False

        drift = abs(current['therapeutic_mean'] - baseline['therapeutic_mean']) / (baseline['therapeutic_mean'] + 0.001)
        if drift > threshold:
            logger.warning(f"DATA DRIFT DETECTED: therapeutic score shifted {drift*100:.1f}%")
            return True
        return False

class ModelDriftDetector:
    """Monitor model prediction distribution changes"""
    def __init__(self, db_path: str = "./feature_store.db"):
        self.db_path = db_path

    def get_feedback_accuracy(self, model_version: str, hours: int = 24) -> float:
        """% of predictions marked correct by users"""
        conn = sqlite3.connect(self.db_path)
        cutoff = datetime.now() - timedelta(hours=hours)
        row = conn.execute("""
            SELECT SUM(feedback_correct), SUM(feedback_count)
            FROM features
            WHERE model_version = ? AND created_at > ?
        """, (model_version, cutoff.isoformat())).fetchone()
        conn.close()

        if not row or row[1] == 0:
            return None
        return row[0] / row[1]

    def detect_drift(self, model_version: str, baseline_accuracy: float, threshold: float = 0.05) -> bool:
        """If feedback accuracy drops > threshold, retrain"""
        current = self.get_feedback_accuracy(model_version)
        if current is None:
            return False

        drop = baseline_accuracy - current
        if drop > threshold:
            logger.warning(f"MODEL DRIFT DETECTED: accuracy dropped {drop*100:.1f}%")
            return True
        return False

class PerformanceMonitor:
    """Track latency, throughput, errors"""
    def __init__(self):
        self.metrics = {}

    def log_inference(self, model_version: str, latency_ms: float, success: bool):
        if model_version not in self.metrics:
            self.metrics[model_version] = {'latencies': [], 'errors': 0, 'total': 0}

        self.metrics[model_version]['latencies'].append(latency_ms)
        self.metrics[model_version]['total'] += 1
        if not success:
            self.metrics[model_version]['errors'] += 1

    def get_stats(self, model_version: str) -> Dict:
        if model_version not in self.metrics:
            return {}

        latencies = self.metrics[model_version]['latencies']
        if not latencies:
            return {}

        latencies.sort()
        return {
            'p50_latency_ms': latencies[len(latencies) // 2],
            'p95_latency_ms': latencies[int(len(latencies) * 0.95)],
            'p99_latency_ms': latencies[int(len(latencies) * 0.99)],
            'error_rate': self.metrics[model_version]['errors'] / self.metrics[model_version]['total'],
            'total_inferences': self.metrics[model_version]['total']
        }

class FeedbackLoop:
    """Collect user corrections → retrain"""
    def __init__(self, db_path: str = "./feature_store.db"):
        self.db_path = db_path

    def record_correction(self, text: str, predicted_label: int, correct_label: int, user_id: str):
        """User says prediction was wrong"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS corrections (
                id INTEGER PRIMARY KEY,
                text TEXT,
                predicted_label INT,
                correct_label INT,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            INSERT INTO corrections (text, predicted_label, correct_label, user_id)
            VALUES (?, ?, ?, ?)
        """, (text, predicted_label, correct_label, user_id))
        conn.commit()
        conn.close()

        logger.info(f"Correction recorded: {user_id} marked prediction as wrong")

    def get_retraining_data(self) -> List[tuple]:
        """Get all corrections for retraining"""
        conn = sqlite3.connect(self.db_path)
        rows = conn.execute("""
            SELECT text, correct_label FROM corrections WHERE correct_label IS NOT NULL
        """).fetchall()
        conn.close()
        return rows

    def should_retrain(self, min_corrections: int = 100) -> bool:
        """Trigger retraining if we have enough feedback"""
        conn = sqlite3.connect(self.db_path)
        count = conn.execute("SELECT COUNT(*) FROM corrections").fetchone()[0]
        conn.close()

        if count >= min_corrections:
            logger.info(f"RETRAIN TRIGGER: {count} corrections accumulated")
            return True
        return False
