"""
Recommendation engine: genuine content first, not engagement-bait
Two-stage: candidate generation (fast, broad) → ranking (slow, precise)
Objectives: therapeutic value, authenticity, creator quality (NOT watch time)
"""

import json
import numpy as np
from typing import List, Dict, Tuple
import sqlite3
from datetime import datetime, timedelta
import logging
import hashlib

logger = logging.getLogger(__name__)

class ContentEmbedding:
    """Embed posts by therapeutic value + authenticity, not engagement"""
    def __init__(self):
        self.dim = 128  # embedding dimension
        self.db_path = "./feature_store.db"

    def embed_post(self, post_id: str, therapeutic_score: float, harmful_score: float,
                   converter_score: float, authenticity_score: float, creator_quality: float) -> np.ndarray:
        """Embed based on content quality, not virality"""
        # Features: what makes content good for Nexus (NOT Instagram)
        embedding = np.zeros(self.dim)

        # Therapeutic value (PRIMARY)
        embedding[0:20] = therapeutic_score * np.random.randn(20)

        # Authenticity (no fake stories, no manipulation)
        embedding[20:40] = authenticity_score * np.random.randn(20)

        # Creator quality (genuine profile, consistent content)
        embedding[40:60] = creator_quality * np.random.randn(20)

        # Converter quality (actionable, not vague)
        embedding[60:80] = converter_score * np.random.randn(20)

        # Anti-signals: suppress engagement-bait
        embedding[80:100] = (1 - harmful_score) * np.random.randn(20)

        # Normalize
        embedding = embedding / (np.linalg.norm(embedding) + 1e-6)

        # Store in DB
        self._store_embedding(post_id, embedding)
        return embedding

    def _store_embedding(self, post_id: str, embedding: np.ndarray):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS post_embeddings (
                post_id TEXT PRIMARY KEY,
                embedding BLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            INSERT OR REPLACE INTO post_embeddings (post_id, embedding)
            VALUES (?, ?)
        """, (post_id, embedding.tobytes()))
        conn.commit()
        conn.close()

    def get_embedding(self, post_id: str) -> np.ndarray:
        conn = sqlite3.connect(self.db_path)
        row = conn.execute("""
            SELECT embedding FROM post_embeddings WHERE post_id = ?
        """, (post_id,)).fetchone()
        conn.close()
        if not row:
            return None
        return np.frombuffer(row[0], dtype=np.float32).reshape(self.dim)

class UserEmbedding:
    """User embedding: what therapeutic content do they engage with?"""
    def __init__(self):
        self.dim = 128
        self.db_path = "./feature_store.db"

    def embed_user(self, user_id: str, interaction_history: List[Dict]) -> np.ndarray:
        """Embed based on genuine interests, not addiction patterns"""
        embedding = np.zeros(self.dim)

        if not interaction_history:
            return embedding / (np.linalg.norm(embedding) + 1e-6)

        # Aggregate post qualities user engages with
        therapeutic_preference = np.mean([p.get('therapeutic_score', 0) for p in interaction_history])
        authenticity_preference = np.mean([p.get('authenticity_score', 0) for p in interaction_history])
        creator_quality_preference = np.mean([p.get('creator_quality', 0) for p in interaction_history])

        embedding[0:20] = therapeutic_preference * np.random.randn(20)
        embedding[20:40] = authenticity_preference * np.random.randn(20)
        embedding[40:60] = creator_quality_preference * np.random.randn(20)

        # Session patterns (avoid addiction signals)
        session_duration = len(interaction_history)
        embedding[60:80] = min(session_duration / 100, 1.0) * np.random.randn(20)

        embedding = embedding / (np.linalg.norm(embedding) + 1e-6)
        self._store_embedding(user_id, embedding)
        return embedding

    def _store_embedding(self, user_id: str, embedding: np.ndarray):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_embeddings (
                user_id TEXT PRIMARY KEY,
                embedding BLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            INSERT OR REPLACE INTO user_embeddings (user_id, embedding, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (user_id, embedding.tobytes()))
        conn.commit()
        conn.close()

    def get_embedding(self, user_id: str) -> np.ndarray:
        conn = sqlite3.connect(self.db_path)
        row = conn.execute("""
            SELECT embedding FROM user_embeddings WHERE user_id = ?
        """, (user_id,)).fetchone()
        conn.close()
        if not row:
            return None
        return np.frombuffer(row[0], dtype=np.float32).reshape(self.dim)

class CandidateGenerator:
    """Stage 1: Fast retrieval (ANN search) - get broad candidate set"""
    def __init__(self):
        self.content_embedding = ContentEmbedding()
        self.user_embedding = UserEmbedding()
        self.db_path = "./feature_store.db"

    def generate_candidates(self, user_id: str, k: int = 100) -> List[str]:
        """Return top K posts similar to user's interests (ANN search)"""
        user_emb = self.user_embedding.get_embedding(user_id)
        if user_emb is None:
            return self._get_fresh_posts(k)

        # Approximate nearest neighbor search (simple: linear scan)
        # In production: use Faiss, Annoy, or Vespa for true ANN
        conn = sqlite3.connect(self.db_path)
        rows = conn.execute("""
            SELECT post_id, embedding FROM post_embeddings
            ORDER BY created_at DESC LIMIT 1000
        """).fetchall()
        conn.close()

        if not rows:
            return self._get_fresh_posts(k)

        # Compute similarity scores
        scores = []
        for post_id, emb_bytes in rows:
            post_emb = np.frombuffer(emb_bytes, dtype=np.float32).reshape(self.content_embedding.dim)
            similarity = np.dot(user_emb, post_emb)  # cosine similarity
            scores.append((post_id, similarity))

        # Return top K
        scores.sort(key=lambda x: x[1], reverse=True)
        return [post_id for post_id, _ in scores[:k]]

    def _get_fresh_posts(self, k: int) -> List[str]:
        """New user: get recent therapeutic posts"""
        conn = sqlite3.connect(self.db_path)
        rows = conn.execute("""
            SELECT post_id FROM features
            WHERE therapeutic_score > 0.5
            ORDER BY created_at DESC
            LIMIT ?
        """, (k,)).fetchall()
        conn.close()
        return [r[0] for r in rows]

class RankingModel:
    """Stage 2: Precise ranking - reorder candidates by business objectives"""
    def __init__(self):
        self.db_path = "./feature_store.db"

    def rank_candidates(self, user_id: str, candidate_posts: List[str]) -> List[Tuple[str, float]]:
        """Rank candidates by: therapeutic value > authenticity > creator quality > converter quality"""
        conn = sqlite3.connect(self.db_path)

        ranked = []
        for post_id in candidate_posts:
            row = conn.execute("""
                SELECT therapeutic_score, label, feedback_correct, feedback_count
                FROM features WHERE text_hash = ?
            """, (post_id,)).fetchone()

            if not row:
                continue

            therapeutic, label, feedback_correct, feedback_count = row

            # Ranking score: multi-objective optimization
            # Primary: therapeutic value
            score = therapeutic * 0.5

            # Secondary: authenticity (label = 1 means therapeutic, not harmful)
            score += (label * 1.0 if label else 0) * 0.3

            # Tertiary: feedback accuracy (users said it was good)
            if feedback_count and feedback_count > 0:
                feedback_ratio = feedback_correct / feedback_count
                score += feedback_ratio * 0.2

            # Penalty: never show harmful content
            if not label:
                score = 0

            ranked.append((post_id, score))

        conn.close()

        # Sort by ranking score
        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked

class RecommendationEngine:
    """Full recommendation system: candidates → ranking → diversify"""
    def __init__(self):
        self.candidate_gen = CandidateGenerator()
        self.ranker = RankingModel()
        self.db_path = "./feature_store.db"

    def recommend(self, user_id: str, num_posts: int = 10, exclude_seen: bool = True) -> List[Dict]:
        """Get personalized feed for user"""
        logger.info(f"Generating recommendations for {user_id}")

        # Stage 1: Candidate generation (fast)
        candidates = self.candidate_gen.generate_candidates(user_id, k=100)
        logger.info(f"Generated {len(candidates)} candidates")

        if exclude_seen:
            candidates = self._filter_seen(user_id, candidates)

        # Stage 2: Ranking (precise)
        ranked = self.ranker.rank_candidates(user_id, candidates)
        logger.info(f"Ranked {len(ranked)} posts")

        # Stage 3: Diversify (don't show same creator twice)
        final_posts = self._diversify(ranked, num_posts)

        # Fetch post metadata
        posts = []
        conn = sqlite3.connect(self.db_path)
        for post_id, score in final_posts:
            row = conn.execute("""
                SELECT text, therapeutic_score, label FROM features WHERE text_hash = ?
            """, (post_id,)).fetchone()
            if row:
                posts.append({
                    'post_id': post_id,
                    'content': row[0],
                    'therapeutic_score': row[1],
                    'is_genuine': bool(row[2]),
                    'ranking_score': score
                })
        conn.close()

        # Log recommendations (for feedback loop)
        self._log_recommendations(user_id, [p['post_id'] for p in posts])

        return posts

    def _filter_seen(self, user_id: str, candidates: List[str]) -> List[str]:
        """Remove posts user already interacted with"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_interactions (
                user_id TEXT,
                post_id TEXT,
                interaction_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, post_id)
            )
        """)

        seen = conn.execute("""
            SELECT post_id FROM user_interactions WHERE user_id = ?
        """, (user_id,)).fetchall()
        conn.close()

        seen_ids = {s[0] for s in seen}
        return [c for c in candidates if c not in seen_ids]

    def _diversify(self, ranked: List[Tuple[str, float]], num_posts: int) -> List[Tuple[str, float]]:
        """Avoid repetitive content from same creator"""
        final = []
        creators_shown = set()

        for post_id, score in ranked:
            # Extract creator from post_id (simplified: assume post_id contains creator_id)
            creator_id = post_id.split('_')[0] if '_' in post_id else post_id

            if creator_id not in creators_shown:
                final.append((post_id, score))
                creators_shown.add(creator_id)

            if len(final) >= num_posts:
                break

        return final

    def _log_recommendations(self, user_id: str, post_ids: List[str]):
        """Log for evaluation"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS recommendations_log (
                user_id TEXT,
                post_ids TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            INSERT INTO recommendations_log (user_id, post_ids)
            VALUES (?, ?)
        """, (user_id, json.dumps(post_ids)))
        conn.commit()
        conn.close()

    def log_interaction(self, user_id: str, post_id: str, interaction_type: str):
        """User viewed/liked/shared post - update embeddings"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            INSERT OR REPLACE INTO user_interactions (user_id, post_id, interaction_type)
            VALUES (?, ?, ?)
        """, (user_id, post_id, interaction_type))
        conn.commit()
        conn.close()

        # Recompute user embedding after interaction
        interactions = conn.execute("""
            SELECT * FROM user_interactions WHERE user_id = ?
        """, (user_id,)).fetchall()
        conn.close()

        if interactions:
            self.candidate_gen.user_embedding.embed_user(user_id, [])
            logger.info(f"Updated embedding for {user_id}")
