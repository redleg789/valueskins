export const checkSexualContent = (text: string, imagePresent: boolean = false): { violated: boolean; reason?: string } => {
  const explicitKeywords = [
    'sex work', 'escort', 'onlyfans', 'nudes', 'sexting', 'pornographic',
    'xxx', 'adult content', 'explicit', 'nude photos', 'sexual services'
  ]

  const solicitation = [
    'pay for', 'buy nudes', 'buy content', 'subscription for photos',
    'exclusive access', 'private content'
  ]

  const textLower = text.toLowerCase()

  for (const keyword of explicitKeywords) {
    if (textLower.includes(keyword)) {
      return { violated: true, reason: 'Sexual content is not allowed on Nexus.' }
    }
  }

  for (const phrase of solicitation) {
    if (textLower.includes(phrase)) {
      return { violated: true, reason: 'Sexual content is not allowed on Nexus.' }
    }
  }

  return { violated: false }
}
