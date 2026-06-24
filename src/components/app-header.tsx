import Link from "next/link";
import { KanbanSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader({
  userEmail,
  children,
}: {
  userEmail: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <KanbanSquare className="h-5 w-5" />
            </div>
            <span className="hidden font-semibold sm:inline">Task Kanban</span>
          </Link>
          {children}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground md:inline">
            {userEmail}
          </span>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
