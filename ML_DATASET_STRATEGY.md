# ML Model Data Strategy: Therapeutic + Conversion-Focused Content

## Goal
Build real ML model trained on:
- Content that heals (therapeutic, supportive, growth-oriented)
- Content that converts (actionable, results-driven, brand-relevant)

## Public Datasets to Use

### 1. Reddit Mental Health Subreddits (Therapeutic)
- **r/GetMotivated** (~1M posts) - motivational, actionable advice
- **r/DecidingToBeBetter** (~500K posts) - self-improvement, genuine struggles
- **r/therapy** (~200K posts) - mental health support, coping strategies
- **r/workadvice** (~300K posts) - professional growth, actionable guidance
- **Source**: Pushshift Reddit API (archived data publicly available)
- **Label**: Therapeutic (positive) vs noise

### 2. HuggingFace Mental Health Dataset
- **CMU-MOSEI** - multimodal emotional content
- **GoEmotions** - 58K Reddit comments labeled by emotion
- **Hate Speech Detection** - contrasts harmful vs supportive language
- **Source**: huggingface.co/datasets
- **Label**: Already labeled by emotion/toxicity

### 3. Twitter/X Creator Economy Content
- **@naval tweets** - wisdom, actionable principles (Lindy effect)
- **@pmarca posts** - technology insights, contrarian thinking
- **@david_perell essays** - long-form educational content
- **Source**: Twitter API (public tweets)
- **Label**: High-engagement, brand-attractive content

### 4. LinkedIn Professional Posts (Conversion Data)
- **Case studies** - results, metrics, before/after
- **Founder stories** - authentic struggle + outcome
- **Career transitions** - relatable + actionable
- **Source**: LinkedIn public posts via web scraping (ethical boundaries)
- **Label**: Deal-converter signals (mentions: results, metrics, outcome)

### 5. Substack Newsletter Archives (Therapeutic + Conversion)
- **The Tim Ferriss Blog** - long-form, deep work
- **Anne-Laure Le Cunff** - learning, neuroscience, wellbeing
- **Paul Graham Essays** - startup wisdom, authenticity
- **Source**: Publicly archived essays
- **Label**: High-quality, therapeutic, conversion-focused

## What Makes Content Therapeutic
- Vulnerability + solution (not just complaining)
- Relatable struggle + actionable steps
- Growth mindset (not fixed mindset)
- Emotional validation + forward movement
- No toxic shame or blame

## What Makes Content Deal-Converter
- Specific metrics (numbers, results)
- Before/after transformation
- Credibility signals (credentials, proof)
- Urgency + clarity (not vague)
- Problem → solution narrative

## ML Model Architecture

### Training Data Composition
```
Total: ~100K labeled posts
- 40K Therapeutic (positive) from Reddit + HuggingFace
- 30K Conversion-focused (deal-ready) from LinkedIn + Substack
- 20K Harmful (to identify what NOT to promote) from GoEmotions
- 10K Neutral/filler posts
```

### Features to Extract
1. **Linguistic**:
   - Sentiment (positive/negative/neutral)
   - Subjectivity (personal experience vs generic)
   - Action words (count of imperative verbs)
   - Specificity (numbers, metrics, concrete examples)

2. **Semantic**:
   - Topic (mental health, career, finance, relationships, etc.)
   - Narrative arc (problem → solution)
   - Emotion (7 emotions from GoEmotions)
   - Confidence (certainty vs hedging language)

3. **Engagement Patterns**:
   - Post length (therapeutic often longer, detailed)
   - Structure (lists, sections, clear hierarchy)
   - Authenticity markers (first-person, vulnerability)
   - Proof signals (metrics, citations, credibility)

### Model Type
**Transformer-based classifier** (BERT-like):
- Input: Post text
- Output: Classification scores for:
  1. Therapeutic score (0-1)
  2. Deal-converter score (0-1)
  3. Violation probability (harmful/toxic/political/religious)
  4. Confidence

## Implementation Path

### Phase 1: Data Collection
```python
# Collect 100K posts from public sources
# Label them: therapeutic, converter, harmful, neutral
# Clean & deduplicate
# Create training/val/test split (70/15/15)
```

### Phase 2: Model Training
```python
# Use HuggingFace transformers library
# Fine-tune DistilBERT or RoBERTa on custom labels
# Train on therapeutic + converter classification
# Add custom violation head (politics, religion, harassment, etc.)
```

### Phase 3: Inference
```python
# For each post: get 3 scores
# Therapeutic: measures healing potential
# Converter: measures brand deal likelihood
# Violation: blocks harmful content
# Combined score = show/hide decision
```

## Why This Works

1. **Real training data** - 100K posts from actual human discussions
2. **Aligned labels** - therapeutic = good for audience, converter = good for brands
3. **Unsupervised learning** - model learns patterns, not hardcoded rules
4. **Generalizable** - trained on Reddit/Twitter/LinkedIn, applies to Nexus posts
5. **Adaptive** - retraining on Nexus moderation feedback over time

## Next Steps

1. Write Python scripts to scrape/download public datasets
2. Create labeling pipeline (manual + semi-supervised)
3. Train DistilBERT model
4. Deploy to Nexus API
5. Collect moderation feedback to retrain monthly
