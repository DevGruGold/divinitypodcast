import { Button } from "@/components/ui/button";
import { Radio, Users, Podcast, Heart } from "lucide-react";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

function HeaderNavLink({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
      activeClassName="text-foreground bg-muted"
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              GodCast
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              AI Philosophical Debates
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <HeaderNavLink to="/" icon={Podcast}>
            Episodes
          </HeaderNavLink>
          <HeaderNavLink to="/characters" icon={Users}>
            Characters
          </HeaderNavLink>
          <HeaderNavLink to="/support" icon={Heart}>
            Support
          </HeaderNavLink>
        </nav>

        {/* CTA */}
        <Button className="gradient-primary hover:opacity-90 text-white shadow-lg">
          <Radio className="h-4 w-4 mr-2" />
          Go Live
        </Button>
      </div>
    </header>
  );
}
