import Link from 'next/link';

/** Internal “Menu” hub — flows & terminology from Commure Ambient design context */
export default function MenuPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-10 pb-16">
      <p className="text-[11px] font-bold uppercase tracking-wide text-commure-teal dark:text-commure-cyan mb-1">
        Menu
      </p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Internal tools &amp; flows</h1>
      <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-8">
        Quick links for this scope workspace. Full UI/UX context lives in{' '}
        <code className="text-[12px] bg-gray-100 dark:bg-commure-navy-muted px-1.5 py-0.5 rounded">
          docs/COMMURE_AMBIENT_DESIGN_CONTEXT.md
        </code>
        .
      </p>

      <section className="mb-10">
        <h2 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Workspace</h2>
        <ul className="space-y-2 text-[14px]">
          <li>
            <Link href="/" className="text-commure-blue-bright dark:text-commure-cyan hover:underline font-medium">
              Visits — Scope one-pager
            </Link>
          </li>
          <li>
            <Link href="/master" className="text-commure-blue-bright dark:text-commure-cyan hover:underline font-medium">
              My Scribes — Master scope sheet
            </Link>
          </li>
          <li>
            <Link href="/product-lines" className="text-commure-blue-bright dark:text-commure-cyan hover:underline font-medium">
              Copilot — Product lines
            </Link>
          </li>
          <li>
            <Link href="/compare" className="text-commure-blue-bright dark:text-commure-cyan hover:underline font-medium">
              Inbox — Compare
            </Link>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Terminology</h2>
        <dl className="text-[13px] space-y-2 text-gray-700 dark:text-gray-300">
          <div>
            <dt className="font-semibold text-gray-900 dark:text-white inline">Scribe</dt>
            <dd className="inline"> — the generated / in-progress note (not the human).</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 dark:text-white inline">MDS</dt>
            <dd className="inline"> — Medical Documentation Specialist (human QA).</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900 dark:text-white inline">Copilot</dt>
            <dd className="inline"> — AI assistant tab.</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-[13px] font-bold text-gray-900 dark:text-white mb-3">Statuses</h2>
        <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">
          Processing · Generated · With MDS · In EHR · Paused · Unassigned · Error
        </p>
      </section>
    </div>
  );
}
