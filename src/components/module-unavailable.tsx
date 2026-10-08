import Link from "next/link";
export function ModuleUnavailable() {
  return <section className="mx-auto max-w-2xl p-8 text-slate-200">
    <h1 className="mb-3 text-2xl font-semibold">This module is not available yet</h1>
    <p>Its data connection and approval workflow are being completed. No changes have been saved.</p>
    <Link href="/" className="mt-6 inline-block underline">Return home</Link>
  </section>;
}
