export const PLATFORM_COMMISSION = 0.05

export const calculateCreatorEarning = (dealAmount: number): { creatorEarns: number; platformEarns: number } => {
  const platformEarns = dealAmount * PLATFORM_COMMISSION
  const creatorEarns = dealAmount - platformEarns

  return {
    creatorEarns: Math.floor(creatorEarns * 100) / 100,
    platformEarns: Math.floor(platformEarns * 100) / 100
  }
}

export const getPaymentBreakdown = (dealAmount: number): string => {
  const breakdown = calculateCreatorEarning(dealAmount)
  return `Deal: $${dealAmount} | Creator earns: $${breakdown.creatorEarns} | Platform: $${breakdown.platformEarns} (5%)`
}

export const getPaymentTimeline = (): { processing: number; delivery: number } => {
  return {
    processing: 5,
    delivery: 7
  }
}

export const getTransparentPaymentTerms = (): string => {
  return `Nexus Payment Terms:
- Platform commission: Fixed 5%
- Payment processing: 5 business days
- Delivery: 7 business days to your account
- No hidden fees
- No sudden rate changes
- No withholding
- You control when you withdraw`
}

export const noFutureRateIncreases = (): { locked: boolean; rate: number } => {
  return {
    locked: true,
    rate: PLATFORM_COMMISSION
  }
}

export const noPaymentWithholding = (): { policy: string } => {
  return {
    policy: 'Nexus never withholds creator payments. Money paid when deal complete.'
  }
}
