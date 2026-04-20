import { checkSexualContent } from './guards/sexualContent'
import { checkHarassment } from './guards/harassment'
import { checkMisinformation } from './guards/misinformation'
import { checkDarkPatterns } from './guards/darkPatterns'
import { checkFOMOLanguage } from './guards/mentalHealth'
import { checkPoliticalContent, noArgumentativePosts } from './guards/politicalManipulation'
import { detectAIPatterns } from './contentQuality'
import { checkChildTargetedContent } from './guards/childProtection'

export interface EthicalGuardsResult {
  allowed: boolean
  violations: string[]
  feedback: string
}

export const runEthicalGuards = (content: string, imagePresent: boolean = false): EthicalGuardsResult => {
  const violations: string[] = []
  const feedbackMessages: string[] = []

  const sexual = checkSexualContent(content, imagePresent)
  if (sexual.violated) {
    violations.push('sexual_content')
    feedbackMessages.push('Nexus is not a platform for sexual content.')
  }

  const aiScore = detectAIPatterns(content)
  if (aiScore > 0.3) {
    violations.push('ai_generated')
    feedbackMessages.push('This content appears AI-generated. Nexus is 100% human-created only.')
  }

  const harassment = checkHarassment(content)
  if (harassment.violated) {
    violations.push('harassment')
    feedbackMessages.push(harassment.reason || 'Harassment is not allowed.')
  }

  const misinformation = checkMisinformation(content)
  if (misinformation.violated) {
    violations.push('misinformation')
    feedbackMessages.push(misinformation.reason || 'Unverified claims are not allowed.')
  }

  const darkPatterns = checkDarkPatterns(content)
  if (darkPatterns.violated) {
    violations.push('dark_patterns')
    feedbackMessages.push(darkPatterns.reason || 'Manipulative language is not allowed.')
  }

  const fomo = checkFOMOLanguage(content)
  if (fomo.violated) {
    violations.push('fomo_language')
    feedbackMessages.push(fomo.reason || 'FOMO-inducing content not allowed.')
  }

  const political = checkPoliticalContent(content)
  if (political.blocked) {
    violations.push('political_content')
    feedbackMessages.push('Nexus is politics-free. Focus on creator economy, not politics.')
  }

  const argumentative = noArgumentativePosts(content)
  if (argumentative.violated) {
    violations.push('argumentative')
    feedbackMessages.push(argumentative.reason || 'Posts designed to provoke arguments not allowed.')
  }

  const childContent = checkChildTargetedContent(content)
  if (childContent.violated) {
    violations.push('child_targeted')
    feedbackMessages.push(childContent.reason || 'Content cannot target minors.')
  }

  return {
    allowed: violations.length === 0,
    violations,
    feedback: feedbackMessages.join(' ')
  }
}

export const getEthicalGuidelinesSummary = (): string => {
  return `Nexus Ethical Guidelines:
✓ Human-created content only (no AI)
✓ No sexual content
✓ No harassment or bullying
✓ No health/financial misinformation
✓ No manipulative dark patterns
✓ No FOMO language
✓ No politics or divisive topics
✓ No argumentative posts designed to provoke
✓ No child-targeted content
✓ Keep it professional, relaxing, and focused on creator economy`
}
