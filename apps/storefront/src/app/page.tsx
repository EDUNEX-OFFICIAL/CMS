import { APP_NAME } from "@repo/shared";
import { Button } from "@repo/ui";

export default function StorefrontPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Phase 0
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {APP_NAME} — Storefront
        </h1>
        <p className="mt-2 text-slate-600">
          Public site rendering stub. Page builder and SEO arrive in later
          phases.
        </p>
      </div>
      <Button>Health: ok</Button>
    </main>
  );
}
