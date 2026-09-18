export interface RuleDefinition {
  name: string
  description: string
  producesGap: boolean
}

export const DEFAULT_RULES: RuleDefinition[] = [
  {
    name: 'IP Assignment (overbroad)',
    description:
      'Flags when the contract assigns ownership of pre-existing work, work outside the project scope, or derivative rights beyond what the project requires. If no IP clause exists, flags the gap — ownership may default to the client.',
    producesGap: true,
  },
  {
    name: 'Payment Terms (unfavorable)',
    description:
      'Flags net-60 or net-90 payment windows, milestone triggers controlled entirely by the client, and absence of late-payment penalties. If no payment timeline exists, flags the gap — there is no enforceable due date.',
    producesGap: true,
  },
  {
    name: 'Termination without guaranteed payment',
    description:
      'Flags contracts where the client can cancel with no kill fee, minimum commitment, or notice period. If no termination clause exists, flags the gap — neither party has a defined exit.',
    producesGap: true,
  },
  {
    name: 'Non-Compete',
    description:
      'Flags restrictions on who the freelancer can work for during or after the engagement. Severity depends on scope, duration, and breadth of restriction.',
    producesGap: false,
  },
  {
    name: 'Indemnification (overbroad)',
    description:
      "Flags clauses that make the freelancer liable for the client's losses, especially losses the freelancer does not control.",
    producesGap: false,
  },
  {
    name: 'Forced Arbitration + Class Action Waiver',
    description:
      'Flags clauses that require arbitration instead of court and waive the right to join a class action.',
    producesGap: false,
  },
]
