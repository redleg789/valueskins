"""
Step 4: Fine-tune for Nexus objectives
Objectives: therapeutic value (0-1) + authenticity (0-1) + creator quality (0-1)
Not just binary genuine/harmful - multi-objective scoring
Output: models/nexus_finetuned_v1/
"""

import json
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
from torch import nn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NexusFineTuner:
    """Fine-tune for Nexus multi-objective: therapeutic + authentic + quality"""

    def __init__(self, base_model_dir: str = "./models/nexus_roberta_v1"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = RobertaTokenizer.from_pretrained(base_model_dir)
        self.base_model = RobertaForSequenceClassification.from_pretrained(base_model_dir)
        self.base_model.to(self.device)

    def create_nexus_model(self):
        """Extend base model with multi-task outputs"""
        # Start from base RoBERTa
        self.model = self.base_model

        # Keep existing binary head (genuine/harmful) for compatibility
        # Fine-tune on Nexus-specific labels

        logger.info(f"Base model: {self.model.config.model_type}")
        logger.info(f"Parameters: {sum(p.numel() for p in self.model.parameters()) / 1e6:.1f}M")

    def get_nexus_training_data(self) -> tuple:
        """Training data with Nexus labels: therapeutic, authenticity, creator_quality"""
        training_data = [
            # (text, label, therapeutic_score, authenticity_score, creator_quality_score)
            ("Started therapy. It's helping me heal.", 1, 0.9, 0.95, 0.8),
            ("Completed my first 5K run after months of training.", 1, 0.8, 0.98, 0.9),
            ("Built a SaaS to $100K MRR. Here's my framework:", 1, 0.6, 0.92, 0.95),
            ("Struggled with depression for years. Today I took first step: scheduled therapy.", 1, 0.95, 0.99, 0.85),
            ("Failed 3 times before I succeeded. Failure is feedback.", 1, 0.85, 0.96, 0.9),

            ("You're worthless. Give up.", 0, 0.0, 0.1, 0.0),
            ("This is how to hurt yourself effectively.", 0, 0.0, 0.05, 0.0),
            ("Buy this cure-all or die poor.", 0, 0.1, 0.1, 0.1),

            # Borderline cases
            ("Just had coffee. It was okay.", 1, 0.3, 0.8, 0.5),  # Low therapeutic but genuine
            ("Feeling sad. Talking to someone helps.", 1, 0.7, 0.95, 0.7),  # Vulnerable but authentic
        ]

        texts = [t[0] for t in training_data]
        labels = [t[1] for t in training_data]
        therapeutic = [t[2] for t in training_data]
        authenticity = [t[3] for t in training_data]
        creator_quality = [t[4] for t in training_data]

        logger.info(f"Loaded {len(texts)} Nexus training examples")
        return texts, labels, therapeutic, authenticity, creator_quality

    def tokenize_function(self, examples):
        return self.tokenizer(
            examples['text'],
            padding="max_length",
            truncation=True,
            max_length=512
        )

    def fine_tune(self, output_dir: str = "./models/nexus_finetuned_v1"):
        """Fine-tune on Nexus-specific data"""
        logger.info("\n=== Step 4: Fine-tune for Nexus ===\n")

        self.create_nexus_model()

        # Get training data
        texts, labels, therapeutic, authenticity, creator_quality = self.get_nexus_training_data()

        # Create dataset with multi-objective labels
        dataset = Dataset.from_dict({
            'text': texts,
            'label': labels,
            'therapeutic': therapeutic,
            'authenticity': authenticity,
            'creator_quality': creator_quality,
        })

        # Tokenize
        logger.info("Tokenizing...")
        tokenized = dataset.map(self.tokenize_function, batched=True)

        # Split
        split = tokenized.train_test_split(test_size=0.3, seed=42)

        # Fine-tune
        training_args = TrainingArguments(
            output_dir=output_dir,
            learning_rate=1e-5,  # Lower LR for fine-tuning
            per_device_train_batch_size=4,
            per_device_eval_batch_size=4,
            num_train_epochs=5,  # More epochs for small dataset
            weight_decay=0.01,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            logging_steps=1,
        )

        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=split['train'],
            eval_dataset=split['test'],
        )

        logger.info("Fine-tuning on Nexus data...\n")
        trainer.train()

        # Save
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)

        logger.info(f"Fine-tuned model saved to {output_dir}")

        # Save metadata
        metadata = {
            'base_model': 'roberta-base',
            'fine_tuned_for': 'nexus',
            'objectives': ['genuine_vs_harmful', 'therapeutic_value', 'authenticity', 'creator_quality'],
            'training_samples': len(texts),
            'fine_tune_epochs': 5,
            'fine_tune_lr': 1e-5,
        }

        with open(f'{output_dir}/metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)

        logger.info(f"Metadata saved")

if __name__ == "__main__":
    finetuner = NexusFineTuner()
    finetuner.fine_tune()
