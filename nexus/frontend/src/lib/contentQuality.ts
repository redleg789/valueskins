export const detectAIPatterns = (text: string): number => {
  let score = 0
  const textLower = text.toLowerCase()

  const corporateLanguage = [
    'leverage', 'synergy', 'paradigm', 'holistic', 'scalable', 'optimize',
    'streamline', 'revolutionary', 'game-changing', 'innovative solution',
    'best practices', 'moving forward', 'at the end of the day',
    'circle back', 'touch base', 'reach out', 'take it offline',
    'bandwidth', 'low-hanging fruit', 'deep dive', 'think outside the box'
  ]

  const listFormatting = text.split('\n').filter(line => /^[•\-*]\s/.test(line)).length
  if (listFormatting > 3) score += 0.15

  const uniformSentences = text.split('.').filter(s => s.trim().length > 30 && s.trim().length < 40).length
  if (uniformSentences > text.split('.').length * 0.5) score += 0.15

  const corporateCount = corporateLanguage.filter(phrase => textLower.includes(phrase)).length
  if (corporateCount > 3) score += 0.2

  const hasPersonalVoice = /i |my |we |our |me |us /.test(textLower)
  if (!hasPersonalVoice && text.length > 200) score += 0.25

  const genericOpenings = [
    'in today\'s world', 'as a result', 'in conclusion', 'furthermore',
    'due to the fact', 'it is important to note', 'needless to say'
  ]
  const genericCount = genericOpenings.filter(phrase => textLower.includes(phrase)).length
  if (genericCount > 0) score += 0.15

  return Math.min(score, 1)
}
