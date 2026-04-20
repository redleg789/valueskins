export const checkMisinformation = (text: string): { violated: boolean; reason?: string } => {
  const healthClaims = [
    'cures cancer', 'prevents covid', 'cures covid', 'prevents disease',
    'doctors don\'t want you', 'secret cure', 'miracle cure', 'heals disease',
    'prevents diabetes', 'cures depression', 'heals autism'
  ]

  const financialClaims = [
    'guaranteed returns', 'can\'t lose', '100% profit', 'risk-free',
    'guaranteed money', 'guaranteed income', 'easy money', 'passive income no work',
    'make money fast', 'quick cash'
  ]

  const textLower = text.toLowerCase()

  for (const claim of healthClaims) {
    if (textLower.includes(claim)) {
      return { violated: true, reason: 'Health claims require verification. Consult medical professionals.' }
    }
  }

  for (const claim of financialClaims) {
    if (textLower.includes(claim)) {
      return { violated: true, reason: 'Financial claims require verification. No guarantees are possible.' }
    }
  }

  return { violated: false }
}
