import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { BRAND, TOOLS, ECOSYSTEM } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-glass-border bg-cosmos/60">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {BRAND.slogan} Free for everyone, forever — no credits, no tokens, no paywalls.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Tools</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {TOOLS.slice(0, 6).map((tool) => (
              <li key={tool.key}>
                <Link to={tool.to} className="transition-colors hover:text-foreground">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Ecosystem</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {ECOSYSTEM.map((item) => (
              <li key={item.name}>{item.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Legal & support</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/app/help" className="transition-colors hover:text-foreground">
                Help Center
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="transition-colors hover:text-foreground"
              >
                {BRAND.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-glass-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {BRAND.company}. {BRAND.subSlogan}
      </div>
    </footer>
  );
}
