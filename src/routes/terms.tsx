import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ALL-IN-1 AI" },
      {
        name: "description",
        content:
          "The terms that govern your use of ALL-IN-1 AI, a free AI workspace with fair-use limits and no paywalls.",
      },
      { property: "og:title", content: "Terms of Service — ALL-IN-1 AI" },
      {
        property: "og:description",
        content: "How ALL-IN-1 AI may be used, and what we promise in return.",
      },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "1. Using ALL-IN-1 AI",
    body: "ALL-IN-1 AI is free for everyone. There are no credits, tokens, subscriptions or paywalls. You need an account so your work stays private to you, and you must be old enough to hold an account where you live.",
  },
  {
    title: "2. Fair use",
    body: "To keep the platform fast for everybody, each account has a generous rolling allowance per tool. If you reach it, you simply wait a short moment and continue. Automated scraping, resale of access, or attempts to bypass these limits are not allowed.",
  },
  {
    title: "3. Your content",
    body: "You keep ownership of everything you type, upload and generate. We store it so you can come back to it, and you can delete any chat, file, image, project or note at any time.",
  },
  {
    title: "4. Acceptable use",
    body: "Do not use ALL-IN-1 AI to create illegal material, harass people, infringe someone else's rights, generate malware, or impersonate others. We may suspend accounts that do.",
  },
  {
    title: "5. AI output",
    body: "AI output can be wrong or out of date. Check anything important before you rely on it, especially code, legal, medical and financial matters. Research citations should always be verified at the source.",
  },
  {
    title: "6. Availability",
    body: "We work to keep the service running, but it is provided as-is without warranties. Features may change as the product evolves.",
  },
  {
    title: "7. Changes and contact",
    body: `We may update these terms; material changes will be announced in the product. Questions go to ${BRAND.supportEmail}.`,
  },
];

function TermsPage() {
  return (
    <div className="galaxy-backdrop min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-gradient">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          These terms cover {BRAND.product}, operated by {BRAND.company}.
        </p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          Company registration details will be added here once confirmed.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
