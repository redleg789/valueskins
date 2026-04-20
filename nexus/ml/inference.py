"""
Real-time inference API for Nexus ethical content model.
Run trained model to score posts in production.
"""

import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from typing import Dict

class EthicalGuardMLModel:
    """Production inference for ethical content scoring."""

    def __init__(self, model_path: str = "./nexus_ethical_model"):
        """Load trained model and tokenizer."""
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = DistilBertTokenizer.from_pretrained(model_path)
        self.model = DistilBertForSequenceClassification.from_pretrained(model_path)
        self.model.to(self.device)
        self.model.eval()

    def score_post(self, content: str) -> Dict[str, float]:
        """
        Score a post for ethical violations + therapeutic/conversion potential.

        Returns:
            {
                'therapeutic': 0.0-1.0 (heals audience),
                'harmful': 0.0-1.0 (violates ethics),
                'converter': 0.0-1.0 (converts deals),
                'allowed': bool (therapeutic > harmful)
            }
        """
        # Tokenize
        inputs = self.tokenizer(
            content,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Predict
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)

        harmful_score = probs[0][0].item()
        therapeutic_score = probs[0][1].item()

        # Converter score = therapeutic + specificity
        # (in production, extract from content: metrics, numbers, actionability)
        converter_score = therapeutic_score * self.extract_converter_signals(content)

        return {
            'therapeutic': therapeutic_score,
            'harmful': harmful_score,
            'converter': converter_score,
            'allowed': therapeutic_score > harmful_score,
            'confidence': max(therapeutic_score, harmful_score)
        }

    def extract_converter_signals(self, content: str) -> float:
        """Extract signals that indicate deal-conversion potential."""
        signals = 0
        max_signals = 5

        # Check for specificity (numbers, metrics)
        if any(char.isdigit() for char in content):
            signals += 1

        # Check for action words (verbs, urgency)
        action_words = ['launched', 'built', 'created', 'achieved', 'reached', 'grew', 'scaled']
        if any(word in content.lower() for word in action_words):
            signals += 1

        # Check for proof/credibility
        proof_words = ['case study', 'proof', 'results', 'before/after', 'framework', 'method']
        if any(word in content.lower() for word in proof_words):
            signals += 1

        # Check for narrative arc (problem -> solution)
        if '->' in content or 'to' in content and 'from' in content:
            signals += 1

        # Check for authenticity (first person, personal story)
        if content.lower().count('i ') + content.lower().count('we ') > 3:
            signals += 1

        return min(signals / max_signals, 1.0)

    def batch_score_posts(self, posts: list) -> list:
        """Score multiple posts efficiently."""
        return [self.score_post(post) for post in posts]


# FastAPI integration (for production deployment)
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel

    app = FastAPI(title="Nexus Ethical Guard ML API")
    model = EthicalGuardMLModel()

    class PostRequest(BaseModel):
        content: str

    class PostScore(BaseModel):
        therapeutic: float
        harmful: float
        converter: float
        allowed: bool
        confidence: float

    @app.post("/score", response_model=PostScore)
    async def score_post(request: PostRequest):
        """Score a post for ethical violations and quality metrics."""
        try:
            result = model.score_post(request.content)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/batch-score")
    async def batch_score(requests: list[PostRequest]):
        """Score multiple posts."""
        posts = [r.content for r in requests]
        return model.batch_score_posts(posts)

    @app.get("/health")
    async def health():
        """Health check."""
        return {"status": "healthy", "model": "ethical-guard-ml"}

except ImportError:
    print("FastAPI not installed. Inference available via score_post() method.")


if __name__ == "__main__":
    # Test inference
    model = EthicalGuardMLModel()

    test_posts = [
        "I've been struggling with depression. Started therapy last week and it's helping.",
        "Just built a SaaS that generates $50K/month. Here's the 3-step framework I used.",
        "You're all idiots if you don't agree with me on this.",
        "Thinking about a career change. Any advice for transitioning to tech?"
    ]

    print("=== Ethical Guard ML Model Inference ===\n")
    for post in test_posts:
        score = model.score_post(post)
        status = "✓ ALLOWED" if score['allowed'] else "✗ BLOCKED"
        print(f"Post: {post[:60]}...")
        print(f"  {status}")
        print(f"  Therapeutic: {score['therapeutic']:.2%}")
        print(f"  Harmful: {score['harmful']:.2%}")
        print(f"  Converter: {score['converter']:.2%}")
        print(f"  Confidence: {score['confidence']:.2%}\n")
