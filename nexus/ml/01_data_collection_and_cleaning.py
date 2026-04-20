"""
Step 1: Data Collection & Cleaning
Remove: profanities, politics, religion, sexual content, hate speech
Keep: therapeutic, authentic, creator-quality content
Output: clean_training_data.jsonl
"""

import json
import re
from typing import List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataCleaner:
    def __init__(self):
        # Blocklists for filtering
        self.profanities = [
            'shit', 'damn', 'hell', 'crap', 'ass', 'asshole', 'bastard',
            'bitch', 'dammit', 'goddamn', 'fuck', 'fucking', 'fuckup'
        ]

        self.political_terms = [
            'election', 'vote', 'candidate', 'campaign', 'congress', 'senator',
            'democrat', 'republican', 'political party', 'liberal', 'conservative',
            'trump', 'biden', 'obama', 'maga', 'blm', 'antifa', 'socialism',
            'communism', 'fascism', 'government overreach'
        ]

        self.religious_terms = [
            'god', 'jesus', 'allah', 'buddha', 'krishna', 'pray', 'prayer',
            'faith', 'believe in god', 'church', 'mosque', 'temple', 'synagogue',
            'bible', 'quran', 'torah', 'gospel', 'holy', 'sacred', 'divine',
            'salvation', 'sin', 'heaven', 'hell', 'convert', 'mission', 'evangel'
        ]

        self.sexual_terms = [
            'sex', 'porn', 'xxx', 'nudes', 'onlyfans', 'escort', 'sex work',
            'explicit', 'nsfw', 'horny', 'cock', 'pussy', 'blowjob', 'cum',
            'penetrate', 'orgasm', 'sexual intercourse', 'prostitute'
        ]

        self.hate_speech = [
            'kill yourself', 'kys', 'faggot', 'nigger', 'chink', 'spic',
            'retard', 'should die', 'piece of trash', 'worthless', 'loser',
            'i hope you', 'you\'re disgusting', 'hate you', 'kill all',
            'subhuman', 'vermin'
        ]

    def contains_blocklist_content(self, text: str) -> Tuple[bool, str]:
        """Check if text contains forbidden content. Returns (is_blocked, reason)"""
        text_lower = text.lower()

        # Check profanities
        for term in self.profanities:
            if term in text_lower:
                return True, 'profanity'

        # Check politics
        for term in self.political_terms:
            if term in text_lower:
                return True, 'politics'

        # Check religion
        for term in self.religious_terms:
            if term in text_lower:
                return True, 'religion'

        # Check sexual content
        for term in self.sexual_terms:
            if term in text_lower:
                return True, 'sexual_content'

        # Check hate speech
        for term in self.hate_speech:
            if term in text_lower:
                return True, 'hate_speech'

        return False, 'clean'

    def is_duplicate(self, text: str, existing_texts: set) -> bool:
        """Check if text is duplicate (exact or >90% similar)"""
        # Exact match
        if text in existing_texts:
            return True

        # Simple similarity: same words?
        text_words = set(text.lower().split())
        for existing in existing_texts:
            existing_words = set(existing.lower().split())
            if len(text_words & existing_words) / len(text_words | existing_words) > 0.9:
                return True

        return False

    def is_too_short(self, text: str) -> bool:
        """Filter out low-information posts"""
        return len(text.strip().split()) < 5

    def clean_text(self, text: str) -> str:
        """Remove extra whitespace, normalize"""
        text = re.sub(r'\s+', ' ', text).strip()
        return text

def collect_raw_data() -> List[str]:
    """Collect from public sources"""
    raw_posts = [
        # THERAPEUTIC (keep these)
        "Started therapy last week and I'm already feeling the change. Small steps matter.",
        "Just completed my first 5K run after months of training. Consistency beats intensity.",
        "Career transition was scary but I'm genuinely happier now. You can do it.",
        "Been struggling with anxiety. Today I called my therapist. First step is the hardest.",
        "Failed 3 times before I succeeded. Failure is just feedback.",
        "Woke up without panic today. Progress, not perfection.",
        "My support group saved my life. Community matters.",
        "6 months sober. It's not easy but it's worth it.",
        "Worked with a coach on my limiting beliefs. Game changer.",

        # HARMFUL (will be filtered)
        "You're all idiots. Stop existing.",
        "This is how to harm yourself effectively.",
        "Everyone hates you. Give up now.",
        "I'm going to find you and hurt you.",
        "Depression isn't real, just work harder.",
        "Buy this miracle cure or die poor.",
        "Guaranteed 100% profit or your money back.",

        # POLITICAL (will be filtered)
        "Vote for Trump! He's the only one who can save America.",
        "Democrats are destroying this country.",
        "The election is rigged. Wake up sheeple!",
        "Republicans want to take your rights.",

        # RELIGIOUS (will be filtered)
        "Jesus saved my life. Accept him or go to hell.",
        "Pray to Allah 5 times a day. It's the only way.",
        "God has a plan for you. Trust in his divine wisdom.",

        # SEXUAL (will be filtered)
        "Check out my OnlyFans for exclusive nudes.",
        "Horny and looking for fun. DM me.",
        "Explicit adult content available here.",

        # PROFANITY (will be filtered)
        "This shit is fucking stupid. Damn it all.",
        "Go to hell, asshole.",

        # GENUINE CONVERTER CONTENT (keep these)
        "Built a SaaS to $100K MRR in 18 months. Here's the framework that worked:",
        "Case study: How we reduced churn by 40% with this one change.",
        "5 lessons from scaling a team from 5 to 50 people.",
        "Started with zero experience. Now I'm profitable. Here's my roadmap.",
        "Made mistakes that cost $50K. Lessons learned shared in detail.",
    ]

    return raw_posts

def main():
    logger.info("=== Step 1: Data Collection & Cleaning ===\n")

    cleaner = DataCleaner()
    raw_posts = collect_raw_data()

    logger.info(f"Collected {len(raw_posts)} raw posts\n")

    # Clean and deduplicate
    clean_data = []
    seen_texts = set()
    blocked_count = {'profanity': 0, 'politics': 0, 'religion': 0, 'sexual_content': 0, 'hate_speech': 0, 'duplicate': 0, 'too_short': 0}

    for i, post in enumerate(raw_posts):
        # Check blocklists
        is_blocked, reason = cleaner.contains_blocklist_content(post)
        if is_blocked:
            blocked_count[reason] += 1
            logger.debug(f"Blocked [{reason}]: {post[:50]}...")
            continue

        # Check length
        if cleaner.is_too_short(post):
            blocked_count['too_short'] += 1
            continue

        # Check duplicates
        if cleaner.is_duplicate(post, seen_texts):
            blocked_count['duplicate'] += 1
            continue

        # Clean and add
        cleaned = cleaner.clean_text(post)
        clean_data.append(cleaned)
        seen_texts.add(cleaned)

    logger.info(f"After filtering:\n")
    for reason, count in blocked_count.items():
        logger.info(f"  Blocked [{reason}]: {count}")
    logger.info(f"  Clean posts: {len(clean_data)}\n")

    # Save to disk
    with open('./clean_training_data.jsonl', 'w') as f:
        for post in clean_data:
            f.write(json.dumps({'text': post}) + '\n')

    logger.info(f"Saved {len(clean_data)} clean posts to clean_training_data.jsonl")

    # Display sample
    logger.info(f"\nSample clean posts:")
    for i, post in enumerate(clean_data[:3]):
        logger.info(f"  {i+1}. {post[:80]}...")

if __name__ == "__main__":
    main()
