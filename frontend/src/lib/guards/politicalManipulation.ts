export const checkPoliticalContent = (text: string): { isPolitical: boolean; blocked: boolean } => {
  const politicalTerms = [
    'democrat', 'republican', 'liberal', 'conservative', 'election', 'voting',
    'campaign', 'candidate', 'political party', 'leftist', 'rightist',
    'trump', 'biden', 'harris', 'vance', 'congress', 'senate', 'parliament',
    'vote for', 'support candidate', 'political bias', 'partisan', 'politics',
    'government policy', 'legislation', 'bill passed', 'law reform',
    'protest', 'rally', 'march', 'strike', 'activism'
  ]

  const polarizingTerms = [
    'us vs them', 'enemies', 'war on', 'crisis', 'woke', 'lib', 'fascist',
    'communist', 'socialist', 'extremist', 'dangerous ideology', 'threat to',
    'conspiracy', 'deep state', 'corrupt government', 'rigged system'
  ]

  const textLower = text.toLowerCase()

  const politicalCount = politicalTerms.filter(t => textLower.includes(t)).length
  const polarizingCount = polarizingTerms.filter(t => textLower.includes(t)).length

  const isPolitical = politicalCount >= 1 || polarizingCount >= 1

  return {
    isPolitical,
    blocked: isPolitical
  }
}

export const getPoliticalPostFeedback = (): string => {
  return 'Nexus is a political-free zone. We focus on creators earning real money, not discussing politics. Keep it professional and relaxing.'
}

export const noArgumentativePosts = (text: string): { violated: boolean; reason?: string } => {
  const argumentativePatterns = [
    'should believe', 'must agree', 'you\'re wrong if', 'can\'t support',
    'immoral to', 'unethical to', 'disgusting that', 'outrageous that',
    'prove me wrong', 'i dare you', 'you\'re crazy if', 'obviously'
  ]

  const textLower = text.toLowerCase()
  const argCount = argumentativePatterns.filter(p => textLower.includes(p)).length

  if (argCount >= 2) {
    return { violated: true, reason: 'Posts designed to provoke arguments are not allowed. Keep it constructive.' }
  }

  return { violated: false }
}
