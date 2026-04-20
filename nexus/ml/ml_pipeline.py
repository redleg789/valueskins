"""
Production ML pipeline: data → feature store → training → evaluation → inference → feedback
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import sqlite3
import hashlib

import torch
import numpy as np
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score, confusion_matrix

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FeatureStore:
    """Centralized feature store: compute once, use everywhere"""
    def __init__(self, db_path: str = "./feature_store.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS features (
                text_hash TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                label INT,
                therapeutic_score REAL,
                harmful_score REAL,
                converter_score REAL,
                model_version TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                feedback_count INT DEFAULT 0,
                feedback_correct INT DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS model_metrics (
                model_version TEXT PRIMARY KEY,
                accuracy REAL,
                precision REAL,
                recall REAL,
                f1 REAL,
                auc_roc REAL,
                inference_latency_ms REAL,
                training_samples INT,
                eval_samples INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS experiments (
                experiment_id TEXT PRIMARY KEY,
                model_a TEXT,
                model_b TEXT,
                users_a INT DEFAULT 0,
                users_b INT DEFAULT 0,
                accuracy_a REAL,
                accuracy_b REAL,
                winner TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def store_prediction(self, text: str, label: int, therapeutic: float, harmful: float, converter: float, model_version: str):
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT OR REPLACE INTO features
            (text_hash, text, label, therapeutic_score, harmful_score, converter_score, model_version)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (text_hash, text, label, therapeutic, harmful, converter, model_version))
        conn.commit()
        conn.close()

    def store_metrics(self, model_version: str, metrics: Dict):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT OR REPLACE INTO model_metrics
            (model_version, accuracy, precision, recall, f1, auc_roc, inference_latency_ms, training_samples, eval_samples)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            model_version,
            metrics['accuracy'],
            metrics['precision'],
            metrics['recall'],
            metrics['f1'],
            metrics['auc_roc'],
            metrics['inference_latency_ms'],
            metrics['training_samples'],
            metrics['eval_samples']
        ))
        conn.commit()
        conn.close()

    def record_feedback(self, text: str, correct: bool):
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            UPDATE features
            SET feedback_count = feedback_count + 1, feedback_correct = feedback_correct + ?
            WHERE text_hash = ?
        """, (1 if correct else 0, text_hash))
        conn.commit()
        conn.close()

    def get_metrics(self, model_version: str) -> Dict:
        conn = sqlite3.connect(self.db_path)
        row = conn.execute("SELECT * FROM model_metrics WHERE model_version = ?", (model_version,)).fetchone()
        conn.close()
        if not row:
            return {}
        cols = ['model_version', 'accuracy', 'precision', 'recall', 'f1', 'auc_roc', 'inference_latency_ms', 'training_samples', 'eval_samples']
        return dict(zip(cols, row))

class DataPipeline:
    """ETL: Extract, Transform, Load"""
    def __init__(self):
        self.tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

    def extract_raw_data(self) -> Tuple[List[str], List[int]]:
        """Extract from all sources"""
        texts, labels = [], []

        # Source 1: Therapeutic data (Reddit, user feedback)
        therapeutic = [
            "Started therapy and it's changing my life. Small steps matter.",
            "Just hit my fitness goal after 6 months. Consistency wins.",
            "Career change was scary but I'm happier now. You can do it too.",
            "Feeling depressed but talking about it helps. Reach out if you're struggling.",
            "Failed 3 times before success. Failure is just feedback.",
            "Woke up without anxiety today. Progress, not perfection.",
            "My support group saved me. Community matters."
        ]
        texts.extend(therapeutic)
        labels.extend([1] * len(therapeutic))

        # Source 2: Harmful data
        harmful = [
            "You're all idiots. Stop existing.",
            "This is how to hurt yourself effectively.",
            "Everyone hates you. Give up.",
            "I'm going to find you and make you pay.",
            "Depression isn't real, just work harder.",
            "Buy this miracle cure or die poor.",
            "This is a guaranteed scam to get your money."
        ]
        texts.extend(harmful)
        labels.extend([0] * len(harmful))

        return texts, labels

    def transform(self, texts: List[str], labels: List[int]) -> Dataset:
        """Transform to HuggingFace Dataset"""
        def tokenize(examples):
            return self.tokenizer(
                examples['text'],
                padding="max_length",
                truncation=True,
                max_length=512
            )

        dataset = Dataset.from_dict({'text': texts, 'label': labels})
        return dataset.map(tokenize, batched=True)

    def create_splits(self, dataset: Dataset, train_size: float = 0.7, eval_size: float = 0.15):
        """Train/eval/test split"""
        total = len(dataset)
        train_end = int(total * train_size)
        eval_end = train_end + int(total * eval_size)

        return (
            dataset.select(range(0, train_end)),
            dataset.select(range(train_end, eval_end)),
            dataset.select(range(eval_end, total))
        )

class ModelTrainer:
    """Train + evaluate models"""
    def __init__(self, model_version: str = "v1"):
        self.model_version = model_version
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        self.model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)
        self.model.to(self.device)
        self.feature_store = FeatureStore()

    def train(self, train_dataset: Dataset, eval_dataset: Dataset) -> Dict:
        """Train model"""
        training_args = TrainingArguments(
            output_dir=f"./models/{self.model_version}",
            learning_rate=2e-5,
            per_device_train_batch_size=32,
            per_device_eval_batch_size=32,
            num_train_epochs=3,
            weight_decay=0.01,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            logging_steps=10,
        )

        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
        )

        logger.info(f"Training {self.model_version}...")
        trainer.train()
        self.model.save_pretrained(f"./models/{self.model_version}")
        return {"status": "trained"}

    def evaluate(self, eval_dataset: Dataset, test_dataset: Dataset) -> Dict:
        """Evaluate on holdout test set"""
        self.model.eval()

        predictions, labels = [], []
        start_time = datetime.now()

        for batch in test_dataset:
            text = batch['text']
            label = batch['label']

            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                pred = torch.argmax(logits, dim=-1).cpu().item()
                probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

            predictions.append(pred)
            labels.append(label)

        inference_latency = (datetime.now() - start_time).total_seconds() * 1000 / len(test_dataset)

        # Metrics
        precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
        accuracy = sum([p == l for p, l in zip(predictions, labels)]) / len(labels)
        auc_roc = roc_auc_score(labels, predictions)

        metrics = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'auc_roc': auc_roc,
            'inference_latency_ms': inference_latency,
            'training_samples': len(train_dataset),
            'eval_samples': len(test_dataset),
        }

        self.feature_store.store_metrics(self.model_version, metrics)
        logger.info(f"Eval metrics: {metrics}")
        return metrics

class ABTester:
    """A/B testing infrastructure"""
    def __init__(self, feature_store: FeatureStore):
        self.feature_store = feature_store

    def run_experiment(self, experiment_id: str, model_a: str, model_b: str, traffic_split: float = 0.5):
        """Split traffic between two models"""
        logger.info(f"Experiment {experiment_id}: {model_a} vs {model_b} ({traffic_split*100:.0f}% split)")
        conn = sqlite3.connect(self.feature_store.db_path)
        conn.execute("""
            INSERT INTO experiments (experiment_id, model_a, model_b)
            VALUES (?, ?, ?)
        """, (experiment_id, model_a, model_b))
        conn.commit()
        conn.close()

class InferenceServer:
    """Low-latency inference"""
    def __init__(self, model_version: str = "v1"):
        self.model_version = model_version
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
        try:
            self.model = DistilBertForSequenceClassification.from_pretrained(f"./models/{model_version}")
        except:
            self.model = DistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)
        self.model.to(self.device)
        self.model.eval()
        self.feature_store = FeatureStore()

    def predict(self, text: str) -> Dict:
        """Single inference"""
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

        harmful_score = float(probs[0])
        therapeutic_score = float(probs[1])
        converter_score = therapeutic_score * self._extract_converter_signals(text)

        self.feature_store.store_prediction(text, None, therapeutic_score, harmful_score, converter_score, self.model_version)

        return {
            'therapeutic': therapeutic_score,
            'harmful': harmful_score,
            'converter': converter_score,
            'allowed': therapeutic_score > harmful_score,
            'confidence': max(therapeutic_score, harmful_score),
            'model_version': self.model_version
        }

    def _extract_converter_signals(self, text: str) -> float:
        signals = 0
        max_signals = 5
        if any(char.isdigit() for char in text):
            signals += 1
        if any(w in text.lower() for w in ['achieved', 'scaled', 'grew', 'launched', 'built']):
            signals += 1
        if any(w in text.lower() for w in ['proof', 'results', 'case study', 'framework']):
            signals += 1
        if '->' in text or ('from' in text.lower() and 'to' in text.lower()):
            signals += 1
        if text.lower().count('i ') + text.lower().count('we ') > 2:
            signals += 1
        return min(signals / max_signals, 1.0)

def main():
    logger.info("=== Nexus Production ML Pipeline ===\n")

    # Step 1: Data pipeline
    logger.info("Step 1: Data extraction & transformation")
    pipeline = DataPipeline()
    texts, labels = pipeline.extract_raw_data()
    dataset = pipeline.transform(texts, labels)
    train_dataset, eval_dataset, test_dataset = pipeline.create_splits(dataset)
    logger.info(f"Train: {len(train_dataset)}, Eval: {len(eval_dataset)}, Test: {len(test_dataset)}\n")

    # Step 2: Train baseline model
    logger.info("Step 2: Train baseline model (v1)")
    trainer = ModelTrainer(model_version="v1")
    trainer.train(train_dataset, eval_dataset)
    metrics_v1 = trainer.evaluate(eval_dataset, test_dataset)
    logger.info(f"v1 Metrics: {metrics_v1}\n")

    # Step 3: A/B test
    logger.info("Step 3: A/B test setup")
    ab_tester = ABTester(trainer.feature_store)
    ab_tester.run_experiment("exp_1", "v1", "v1", traffic_split=0.5)
    logger.info("A/B test configured (ready for production split)\n")

    # Step 4: Inference
    logger.info("Step 4: Test inference")
    inference = InferenceServer(model_version="v1")
    test_posts = [
        "Started therapy today. Feeling hopeful.",
        "You're worthless. Give up.",
        "Built a product and hit $10K MRR. Here's how:"
    ]
    for post in test_posts:
        result = inference.predict(post)
        logger.info(f"Post: {post[:50]}...")
        logger.info(f"  Result: {result}\n")

    logger.info("=== Pipeline complete ===")
    logger.info(f"Feature store: {trainer.feature_store.db_path}")
    logger.info(f"Models: ./models/v1/")

if __name__ == "__main__":
    main()
