const MIN_AGE = 18

export const checkAgeVerification = (userAge: number | null): { verified: boolean; reason?: string } => {
  if (userAge === null || userAge === undefined) {
    return { verified: false, reason: 'Nexus requires users to be 18+.' }
  }

  if (userAge < MIN_AGE) {
    return { verified: false, reason: 'Nexus requires users to be 18+.' }
  }

  return { verified: true }
}

export const checkChildTargetedContent = (text: string): { violated: boolean; reason?: string } => {
  const childTargetingPhrases = [
    'kids', 'children', 'teen', 'minors', 'students', 'younger audience',
    'babysitting', 'tutoring for students', 'school supplies'
  ]

  const textLower = text.toLowerCase()

  for (const phrase of childTargetingPhrases) {
    if (textLower.includes(phrase)) {
      return { violated: true, reason: 'Content cannot target minors. Nexus is 18+ only.' }
    }
  }

  return { violated: false }
}
