'use client'

import { useState, useEffect } from 'react'

/* ------------------------------------------------------------------ */
/*  Sample data — authored, realistic, labeled synthetic               */
/* ------------------------------------------------------------------ */

const sampleFindings = [
  {
    id: 1,
    rule: 'IP Assignment',
    severity: 'critical' as const,
    assessment:
      'This clause assigns all derivative works and pre-existing materials to the client, including work created before this engagement.',
    citation:
      '"Contractor hereby assigns to Client all right, title, and interest in and to any and all work product, including but not limited to derivative works, pre-existing materials, and any intellectual property created prior to or during the term of this Agreement."',
    counterOffer:
      'Contractor assigns rights to deliverables created specifically for this project. Pre-existing materials and work outside the project scope remain the property of Contractor, with a non-exclusive license granted to Client for project use.',
  },
  {
    id: 2,
    rule: 'Non-Compete',
    severity: 'critical' as const,
    assessment:
      'A 24-month restriction covering the entire industry. This would prevent you from working with any competing business for two years after the engagement ends.',
    citation:
      '"For a period of twenty-four (24) months following termination, Contractor shall not directly or indirectly engage in any business that competes with Client\'s business within the same industry."',
    counterOffer:
      'Contractor agrees not to provide substantially similar services to [named direct competitor] for a period of six (6) months following termination. This restriction does not apply to other clients or industries.',
  },
  {
    id: 3,
    rule: 'Payment Terms',
    severity: 'moderate' as const,
    assessment:
      'Net-90 payment with no late-payment penalty. The client controls when milestones are approved, which controls when you get paid.',
    citation:
      '"Payment shall be made within ninety (90) days of Client\'s approval of each milestone. Milestone approval is at Client\'s sole discretion."',
    counterOffer:
      'Payment shall be made within thirty (30) days of milestone submission. If Client does not respond within fourteen (14) days, the milestone is deemed approved. Late payments accrue interest at 1.5% per month.',
  },
  {
    id: 4,
    rule: 'Termination',
    severity: 'moderate' as const,
    assessment:
      'The client can terminate at any time with no financial obligation. You absorb the loss of blocked time.',
    citation:
      '"Client may terminate this Agreement at any time, for any reason, upon written notice to Contractor. Upon termination, Client shall have no further obligations to Contractor."',
    counterOffer:
      'Either party may terminate with fourteen (14) days written notice. Upon termination, Client shall pay for all work completed through the termination date plus a kill fee equal to 25% of the remaining contract value.',
  },
]

const checkedRules = [
  { rule: 'IP Assignment', status: 'critical' as const },
  { rule: 'Payment Terms', status: 'moderate' as const },
  { rule: 'Termination', status: 'moderate' as const },
  { rule: 'Non-Compete', status: 'critical' as const },
  { rule: 'Indemnification', status: 'clear' as const },
  { rule: 'Forced Arbitration', status: 'clear' as const },
]

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function SeverityPill({ severity }: { severity: 'critical' | 'moderate' }) {
  const colors =
    severity === 'critical'
      ? 'bg-severity-critical text-white'
      : 'bg-severity-moderate text-navy'
  return (
    <span
      className={`${colors} text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm`}
    >
      {severity}
    </span>
  )
}

function FindingRow({
  finding,
  isExpanded,
  onToggle,
}: {
  finding: (typeof sampleFindings)[number]
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <SeverityPill severity={finding.severity} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-navy text-sm">{finding.rule}</p>
          <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">
            {finding.assessment}
          </p>
        </div>
        <span
          className="text-slate-400 mt-1 shrink-0 transition-transform duration-300 ease-out"
          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 space-y-4">
            <div className="bg-slate-50 border-l border-navy px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Cited from your contract
              </p>
              <p className="font-[family-name:var(--font-mono)] text-sm text-navy leading-relaxed">
                {finding.citation}
              </p>
            </div>

            <div className="bg-emerald-50 border-l border-severity-clear px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Counter-offer
              </p>
              <p className="text-sm text-navy leading-relaxed">
                {finding.counterOffer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  const [expandedId, setExpandedId] = useState<number>(1)
  const [reportVisible, setReportVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReportVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <main>
      {/* ---- First viewport: the diagnostic report as hero ---- */}
      <section className="min-h-screen flex flex-col justify-center px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-navy leading-tight">
          Redline
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mt-3 leading-relaxed">
          Your contract, diagnosed.
        </p>

        {/* The report */}
        <div
          className="mt-10 border border-slate-200 rounded-md bg-white shadow-sm shadow-slate-200/50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: reportVisible ? 1 : 0,
            transform: reportVisible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          {/* Report header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <p className="font-semibold text-navy text-sm">
              Acme Corp — Freelance Design Agreement
            </p>
            <div className="flex items-center gap-3 text-xs tabular-nums">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-severity-critical" />
                2 critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-severity-moderate" />
                2 moderate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-severity-clear" />
                2 clear
              </span>
            </div>
          </div>

          {/* Findings */}
          <div>
            {sampleFindings.map((f) => (
              <FindingRow
                key={f.id}
                finding={f}
                isExpanded={expandedId === f.id}
                onToggle={() =>
                  setExpandedId(expandedId === f.id ? -1 : f.id)
                }
              />
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400 italic">
          Synthetic sample — authored to demonstrate the analysis format.
        </p>

        {/* CTA */}
        <a
          href="/login"
          className="mt-8 inline-flex items-center justify-center bg-navy text-white font-semibold text-base px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors self-start"
        >
          Try it on your contract
        </a>
      </section>

      {/* ---- How it works ---- */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy">How it works</h2>

          <ol className="mt-10 space-y-8 list-decimal list-inside">
            <li className="text-navy">
              <span className="font-semibold">Upload or paste your contract.</span>
              <span className="text-slate-600 text-sm ml-1">
                Accepts .txt, .pdf, and .docx files. Parsing happens in your
                browser — the original file never leaves your machine.
              </span>
            </li>

            <li className="text-navy">
              <span className="font-semibold">Get ranked findings with exact citations.</span>
              <span className="text-slate-600 text-sm ml-1">
                Every risk flag names the problem, cites the exact sentence
                from your contract, and ranks the severity based on the
                specific language — scope, duration, one-sidedness.
              </span>
            </li>

            <li className="text-navy">
              <span className="font-semibold">Send back the counter-offer.</span>
              <span className="text-slate-600 text-sm ml-1">
                Each finding comes with drafted alternative language specific
                to your contract shape — hourly, retainer, or project-based.
                Copy and send it to your client.
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* ---- What gets checked ---- */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy">
            Six rules, checked every time
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-xl">
            These defaults ship tuned for freelancer contracts. You can toggle
            them, reword them, add your own, or delete the ones that don't apply
            to your work.
          </p>

          <div className="mt-8 border border-slate-200 rounded-md divide-y divide-slate-200">
            {checkedRules.map((r) => (
              <div
                key={r.rule}
                className="px-5 py-3.5 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-navy">{r.rule}</span>
                {r.status === 'clear' ? (
                  <span className="text-xs font-semibold text-severity-clear uppercase tracking-wider">
                    Clear
                  </span>
                ) : r.status === 'critical' ? (
                  <span className="text-xs font-semibold text-severity-critical uppercase tracking-wider">
                    Critical
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-severity-moderate uppercase tracking-wider">
                    Moderate
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- What this is not ---- */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-navy">What this is not</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-600 leading-relaxed">
            <p>
              <strong className="text-navy">Not legal advice.</strong> Redline
              flags what the language says and cites the exact sentence. It does
              not tell you whether to sign and does not comment on enforceability.
            </p>
            <p>
              <strong className="text-navy">No scanned documents.</strong> The
              tool parses text-based files only — .txt, .pdf, .docx. Image-based
              or photographed pages are rejected because OCR errors would break
              the citations, and a citation you cannot trust is worse than no
              citation.
            </p>
            <p>
              <strong className="text-navy">
                No prices, no testimonials on this page.
              </strong>{' '}
              The product is not priced yet. There are no customer quotes because
              there are no customers yet. What you see above is what the tool
              does.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Bottom CTA ---- */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-navy">
            71% of freelancers have experienced non-payment.
          </h2>
          <p className="text-slate-600 mt-3 leading-relaxed">
            The clause that costs you is already in the contract. Redline finds
            the sentence and tells you what to say back.
          </p>
          <a
            href="/login"
            className="mt-8 inline-flex items-center justify-center bg-navy text-white font-semibold text-base px-8 py-3.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            Try it on your contract
          </a>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <p>Redline</p>
          <p>
            Built for freelancers reviewing inbound contracts.
          </p>
        </div>
      </footer>
    </main>
  )
}
