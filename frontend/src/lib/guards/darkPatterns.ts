export const checkDarkPatterns = (text: string): { violated: boolean; reason?: string } => {
  const fakeUrgency = [
    'limited time', 'only x spots', 'act now', 'hurry', 'ends today',
    'expires soon', 'last chance', 'before it\'s gone', 'don\'t miss out'
  ]

  const hiddenCosts = [
    'free*', '*terms apply', 'no cost*', 'hidden fees', 'surprise charge'
  ]

  const violationCount = fakeUrgency.filter(p => text.toLowerCase().includes(p)).length +
                        hiddenCosts.filter(p => text.toLowerCase().includes(p)).length

  if (violationCount >= 2) {
    return { violated: true, reason: 'Manipulative language is not allowed. Be transparent about terms and timing.' }
  }

  return { violated: false }
}
