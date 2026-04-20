"""
Step 3: Validation & Benchmarking
Test against known datasets: genuine vs harmful
Metrics: precision, recall, F1, AUC-ROC
Output: validation_report.json
"""

import json
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification
from sklearn.metrics import precision_recall_fscore_support, roc_auc_score, confusion_matrix, classification_report
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Validator:
    """Validate model against test benchmarks"""

    def __init__(self, model_dir: str = "./models/nexus_roberta_v1"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = RobertaTokenizer.from_pretrained(model_dir)
        self.model = RobertaForSequenceClassification.from_pretrained(model_dir)
        self.model.to(self.device)
        self.model.eval()

    def get_benchmark_data(self):
        """Known-good test cases"""
        test_cases = [
            # GENUINE THERAPEUTIC (label=1)
            ("Started therapy and feeling hopeful about the future", 1),
            ("Completed my first 5K run. Consistency matters.", 1),
            ("Built a product and got 1000 users in week 1. Here's how.", 1),
            ("Struggled with depression but support helped me recover", 1),
            ("Career change was scary but I'm happier now", 1),

            # HARMFUL (label=0)
            ("You're worthless. Give up now.", 0),
            ("This is how to kill yourself effectively.", 0),
            ("Everyone hates you. Why bother?", 0),
            ("Buy this miracle cure or die poor.", 0),
            ("I'm going to find you and hurt you.", 0),

            # EDGE CASES
            ("Just had coffee. It was good.", 1),  # Neutral but harmless
            ("Feeling sad today. Will talk to someone.", 1),  # Vulnerable but therapeutic
            ("You're stupid for that opinion.", 0),  # Mildly hostile
        ]
        return test_cases

    def predict(self, text: str) -> tuple:
        """Get prediction for text. Returns (label, confidence)"""
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)

        pred_label = torch.argmax(probs, dim=-1).item()
        confidence = probs[0][pred_label].item()

        return pred_label, confidence

    def validate(self) -> dict:
        """Run validation"""
        logger.info("\n=== Step 3: Validation & Benchmarking ===\n")

        test_cases = self.get_benchmark_data()
        predictions, true_labels = [], []

        logger.info("Testing on benchmark cases:\n")
        for text, true_label in test_cases:
            pred_label, confidence = self.predict(text)
            predictions.append(pred_label)
            true_labels.append(true_label)

            status = "✓" if pred_label == true_label else "✗"
            logger.info(f"{status} {text[:60]}...")
            logger.info(f"  True: {true_label}, Pred: {pred_label}, Confidence: {confidence:.2%}\n")

        # Metrics
        precision, recall, f1, _ = precision_recall_fscore_support(true_labels, predictions, average='binary')
        accuracy = sum([p == t for p, t in zip(predictions, true_labels)]) / len(true_labels)
        auc = roc_auc_score(true_labels, predictions)
        cm = confusion_matrix(true_labels, predictions)

        logger.info("=== Results ===\n")
        logger.info(f"Accuracy:  {accuracy:.2%}")
        logger.info(f"Precision: {precision:.2%} (of predicted genuine, how many are actually genuine?)")
        logger.info(f"Recall:    {recall:.2%} (of actual genuine, how many did we catch?)")
        logger.info(f"F1 Score:  {f1:.2%} (balance of precision & recall)")
        logger.info(f"AUC-ROC:   {auc:.2%} (discrimination ability)\n")

        logger.info("Confusion Matrix:")
        logger.info(f"  True Negatives (correct harmful):  {cm[0][0]}")
        logger.info(f"  False Positives (falsely genuine): {cm[0][1]}")
        logger.info(f"  False Negatives (missed harmful):  {cm[1][0]}")
        logger.info(f"  True Positives (correct genuine):  {cm[1][1]}\n")

        # Decision: pass/fail
        passes = {
            'accuracy': accuracy > 0.8,
            'precision': precision > 0.8,
            'recall': recall > 0.7,
            'f1': f1 > 0.75,
        }

        logger.info("Validation Thresholds:")
        for metric, passed in passes.items():
            status = "PASS" if passed else "FAIL"
            logger.info(f"  {metric}: {status}")

        all_passed = all(passes.values())
        logger.info(f"\nOverall: {'PASS ✓' if all_passed else 'FAIL ✗'}")

        # Save report
        report = {
            'model': 'roberta-base',
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1),
            'auc_roc': float(auc),
            'test_cases': len(test_cases),
            'passed': all_passed,
            'threshold_accuracy': 0.8,
            'threshold_precision': 0.8,
            'threshold_recall': 0.7,
            'threshold_f1': 0.75,
        }

        with open('./validation_report.json', 'w') as f:
            json.dump(report, f, indent=2)

        logger.info("\nReport saved to validation_report.json")

        return report

if __name__ == "__main__":
    validator = Validator()
    validator.validate()
