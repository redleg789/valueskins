export interface EthicalGuardsResult {
  allowed: boolean;
  violations: string[];
  feedback: string;
}

export function runEthicalGuards(content: string): EthicalGuardsResult {
  const violations: string[] = [];

  if (!content || content.trim().length === 0) {
    violations.push('Content cannot be empty');
  }

  return {
    allowed: violations.length === 0,
    violations,
    feedback: violations.length > 0 ? 'Content violates community guidelines' : 'OK'
  };
}
