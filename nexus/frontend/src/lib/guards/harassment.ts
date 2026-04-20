export const checkHarassment = (text: string): { violated: boolean; reason?: string } => {
  const slurs = [
    'retard', 'faggot', 'nigger', 'chink', 'spic', 'kike', 'beaner',
    'towelhead', 'raghead', 'cracker'
  ]

  const threats = [
    'i will kill', 'you should die', 'go kill yourself', 'i hope you die',
    'threat', 'gonna hurt', 'gonna beat', 'gonna find you'
  ]

  const attackPhrases = [
    'you\'re disgusting', 'you\'re trash', 'you don\'t deserve',
    'everyone hates you', 'you\'re worthless'
  ]

  const textLower = text.toLowerCase()

  for (const slur of slurs) {
    if (textLower.includes(slur)) {
      return { violated: true, reason: 'Harassment and slurs are not allowed.' }
    }
  }

  for (const threat of threats) {
    if (textLower.includes(threat)) {
      return { violated: true, reason: 'Threats and violence are not allowed.' }
    }
  }

  for (const phrase of attackPhrases) {
    if (textLower.includes(phrase)) {
      return { violated: true, reason: 'Targeted harassment is not allowed.' }
    }
  }

  return { violated: false }
}
