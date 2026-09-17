import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ALL-IN-1 AI" },
      {
        name: "description",
        content:
          "How ALL-IN-1 AI handles your account, chats, files, images and projects — private to you by default.",
      },
      { property: "og:title", content: "Privacy Policy — ALL-IN-1 AI" },
      {
        property: "og:description",
        content: "Your data stays yours. Here is exactly what we store and why.",
      },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we store",
    body: "Your account details (email, username, display name), your settings, and the work you create: chats, generated images, code snippets, uploaded files, research sessions, agent tasks, projects and notes.",
  },
  {
    title: "Who can see it",
    body: "Only you. Access is enforced at the database level, so one account can never read another account's rows. Support staff only see a ticket or report you submit yourself.",
  },
  {
    title: "AI processing",
    body: "Prompts and the content you attach are sent to AI model providers to produce a response. Only what is needed for that request is sent, and it is not used to advertise to you.",
  },
  {
    title: "Fair-use records",
    body: "We record the time and tool of each request so we can apply fair-use limits. These records contain no prompt content.",
  },
  {
    title: "AI memory",
    body: "Memory is optional. You control what the assistant remembers about you in Settings, and you can clear it at any time.",
  },
  {
    title: "Deleting your data",
    body: "You can delete any item from inside the product. Ask us to remove your whole account and everything attached to it is deleted with it.",
  },
  {
    title: "Contact",
    body: `Privacy questions go to ${BRAND.supportEmail}.`,
  },
];

function PrivacyPage() {
  return (
    <div className="galaxy-backdrop min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-gradient">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {BRAND.company} keeps your work private to your account.
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
      </main>
      <SiteFooter />
    </div>
  );
}
