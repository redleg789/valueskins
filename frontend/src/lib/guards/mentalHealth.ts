export const checkFOMOLanguage = (text: string): { violated: boolean; reason?: string } => {
  const fomoPatterns = [
    'everyone is', 'you\'re missing out', 'going viral', 'everyone\'s doing',
    'don\'t get left behind', 'join before', 'all your friends', 'trending now'
  ]

  const textLower = text.toLowerCase()
  const fomoCount = fomoPatterns.filter(p => textLower.includes(p)).length

  if (fomoCount >= 1) {
    return { violated: true, reason: 'FOMO-inducing content is not allowed. Focus on genuine value.' }
  }

  return { violated: false }
}
