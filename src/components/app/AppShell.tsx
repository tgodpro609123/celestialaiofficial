import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  FolderKanban,
  HardDrive,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS } from "@/lib/brand";
import { cn } from "@/lib/utils";

const extraNav = [
  { name: "Dashboard", to: "/app", icon: LayoutDashboard },
  { name: "Projects", to: "/app/projects", icon: FolderKanban },
  { name: "File library", to: "/app/library", icon: HardDrive },
  { name: "Settings", to: "/app/settings", icon: Settings },
  { name: "Help & support", to: "/app/help", icon: LifeBuoy },
] as const;

export function AppShell() {
  const { profile, user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "/")) {
        event.preventDefault();
        setSearch((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data: settings } = useQuery({
    queryKey: ["user-settings", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("font_scale, reduce_motion")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-scale", String(settings?.font_scale ?? 1));
    root.classList.toggle("reduce-motion", Boolean(settings?.reduce_motion));
  }, [settings?.font_scale, settings?.reduce_motion]);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, body, read, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const unread = notifications.filter((n) => !n.read).length;
  const initials = (profile?.display_name || profile?.username || user?.email || "?")
    .slice(0, 2)
    .toUpperCase();

  async function markAllRead() {
    if (!unread) return;
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    void queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  const nav = (
    <ScrollArea className="h-full">
      <nav className="space-y-6 p-4">
        <div className="space-y-1">
          {extraNav.slice(0, 1).map((item) => (
            <NavLink key={item.to} {...item} active={pathname === item.to} />
          ))}
        </div>
        <div>
          <p className="px-3 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            Tools
          </p>
          <div className="space-y-1">
            {TOOLS.filter((tool) => tool.key !== "projects").map((tool) => (
              <NavLink
                key={tool.to}
                name={tool.name}
                to={tool.to}
                icon={tool.icon}
                active={pathname.startsWith(tool.to)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="px-3 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            Workspace
          </p>
          <div className="space-y-1">
            {extraNav.slice(1).map((item) => (
              <NavLink key={item.to} {...item} active={pathname.startsWith(item.to)} />
            ))}
            {isAdmin && (
              <NavLink
                name="Admin"
                to="/admin"
                icon={Shield}
                active={pathname.startsWith("/admin")}
              />
            )}
          </div>
        </div>
        <div className="rounded-xl border border-glass-border bg-background/40 p-3 text-xs text-muted-foreground">
          Every tool is free, forever. Fair-use limits only — no credits, no paywalls.
        </div>
      </nav>
    </ScrollArea>
  );

  return (
    <div className="galaxy-backdrop min-h-screen">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-glass-border bg-background/50 backdrop-blur-xl lg:block">
          <div className="flex h-16 items-center px-5">
            <Link to="/app" aria-label="Dashboard">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="h-[calc(100vh-4rem)]">{nav}</div>
        </aside>

        <Sheet open={drawer} onOpenChange={setDrawer}>
          <SheetContent side="left" className="w-72 border-glass-border bg-background/95 p-0">
            <div className="flex h-16 items-center px-5">
              <Logo size="sm" />
            </div>
            <div className="h-[calc(100vh-4rem)]">{nav}</div>
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-glass-border bg-background/70 px-3 backdrop-blur-xl sm:px-5">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setDrawer(true)}
            >
              <Menu className="size-5" />
            </Button>

            <button
              onClick={() => setSearch(true)}
              className="flex flex-1 items-center gap-2 rounded-lg border border-glass-border bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:max-w-sm"
            >
              <Search className="size-4" />
              <span className="truncate">Search tools and actions</span>
              <kbd className="ml-auto hidden font-mono text-[10px] text-muted-foreground sm:block">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quick actions"
                onClick={() => setSearch(true)}
              >
                <Sparkles className="size-5" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                    <Bell className="size-5" />
                    {unread > 0 && (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 border-glass-border bg-background/95 p-0">
                  <div className="flex items-center justify-between border-b border-glass-border px-4 py-3">
                    <p className="text-sm font-medium">Notifications</p>
                    {unread > 0 && (
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => void markAllRead()}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">
                        Nothing yet. Updates about your tasks and tickets show up here.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div key={item.id} className="border-b border-glass-border/60 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-foreground">{item.title}</p>
                            {!item.read && <Badge variant="secondary">New</Badge>}
                          </div>
                          {item.body && (
                            <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full" aria-label="Account menu">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/20 text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm">{profile?.display_name || profile?.username || "You"}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/app/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/app/help">Help & support</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Admin dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void handleSignOut()}>
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      <CommandDialog open={search} onOpenChange={setSearch}>
        <CommandInput placeholder="Jump to a tool or action…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>
          <CommandGroup heading="Tools">
            {TOOLS.map((tool) => (
              <CommandItem
                key={tool.to}
                value={`${tool.name} ${tool.tagline}`}
                onSelect={() => {
                  setSearch(false);
                  void navigate({ to: tool.to });
                }}
              >
                <tool.icon className="mr-2 size-4" />
                {tool.name}
                <span className="ml-2 text-xs text-muted-foreground">{tool.tagline}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Workspace">
            {extraNav.map((item) => (
              <CommandItem
                key={item.to}
                value={item.name}
                onSelect={() => {
                  setSearch(false);
                  void navigate({ to: item.to });
                }}
              >
                <item.icon className="mr-2 size-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

function NavLink({
  name,
  to,
  icon: Icon,
  active,
}: {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/15 text-foreground glow-ring"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {name}
    </Link>
  );
}
