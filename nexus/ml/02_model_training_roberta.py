"""
Step 2: Train on Foundation Model
Model: RoBERTa-base (better accuracy for genuine content detection)
Tokenize & fine-tune for 2-class: genuine (1) vs harmful (0)
Output: models/nexus_roberta_v1/
"""

import json
import torch
from transformers import RobertaTokenizer, RobertaForSequenceClassification, Trainer, TrainingArguments
from datasets import Dataset
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NexusModelTrainer:
    """RoBERTa fine-tuned for Nexus: genuine vs harmful detection"""

    def __init__(self, model_name: str = "roberta-base"):
        self.model_name = model_name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")

        self.tokenizer = RobertaTokenizer.from_pretrained(model_name)
        self.model = RobertaForSequenceClassification.from_pretrained(model_name, num_labels=2)
        self.model.to(self.device)

    def load_training_data(self) -> tuple:
        """Load cleaned data from Step 1"""
        texts, labels = [], []

        try:
            with open('./clean_training_data.jsonl', 'r') as f:
                for line in f:
                    data = json.loads(line)
                    texts.append(data['text'])
                    labels.append(1)  # All cleaned data is genuine
        except FileNotFoundError:
            logger.warning("clean_training_data.jsonl not found. Using fallback data.")
            texts = [
                "Started therapy and feeling better.",
                "Built a product to $50K MRR.",
                "Consistency beats intensity.",
            ]
            labels = [1, 1, 1]

        # Add some harmful examples for balance
        harmful = [
            "You're worthless. Give up.",
            "This is a scam to steal your money.",
        ]
        texts.extend(harmful)
        labels.extend([0, 0])

        logger.info(f"Loaded {len(texts)} training examples ({sum(labels)} genuine, {len(labels) - sum(labels)} harmful)")
        return texts, labels

    def tokenize_function(self, examples):
        """Tokenize text"""
        return self.tokenizer(
            examples['text'],
            padding="max_length",
            truncation=True,
            max_length=512
        )

    def train(self, output_dir: str = "./models/nexus_roberta_v1"):
        """Fine-tune RoBERTa on Nexus data"""
        logger.info("\n=== Step 2: Model Training (RoBERTa) ===\n")

        # Load data
        texts, labels = self.load_training_data()

        # Create dataset
        dataset = Dataset.from_dict({'text': texts, 'label': labels})

        # Tokenize
        logger.info("Tokenizing...")
        tokenized_dataset = dataset.map(self.tokenize_function, batched=True)

        # Split: 70% train, 30% eval
        split = tokenized_dataset.train_test_split(test_size=0.3, seed=42)
        train_dataset = split['train']
        eval_dataset = split['test']

        logger.info(f"Train: {len(train_dataset)}, Eval: {len(eval_dataset)}")

        # Training args
        training_args = TrainingArguments(
            output_dir=output_dir,
            learning_rate=2e-5,
            per_device_train_batch_size=8,
            per_device_eval_batch_size=8,
            num_train_epochs=3,
            weight_decay=0.01,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            logging_steps=1,
        )

        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
        )

        logger.info("Training RoBERTa...\n")
        trainer.train()

        # Save
        self.model.save_pretrained(output_dir)
        self.tokenizer.save_pretrained(output_dir)
        logger.info(f"\nModel saved to {output_dir}")

        return trainer, train_dataset, eval_dataset

if __name__ == "__main__":
    trainer_obj = NexusModelTrainer(model_name="roberta-base")
    trainer, train_ds, eval_ds = trainer_obj.train()
