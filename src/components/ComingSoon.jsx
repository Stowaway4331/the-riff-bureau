const OPENING_SOON = ['Drums', 'Piano', 'Singing'];

/**
 * Teaser above the registration form: a link through to the standalone
 * `#/coming-soon` page (App swaps the view on the hash change - no router).
 * `className` lets the host section hand it a scroll-reveal class.
 */
export function ComingSoon({ className = '' }) {
  return (
    <div className={`coming-soon ${className}`.trim()} >
      <p className="coming-soon-eyebrow">Coming Soon</p>

      <p className="coming-soon-title">
        Drums, Piano &amp; Singing classes &mdash; Select them below to pre-book a slot.
      </p>
    </div>
  );
}
