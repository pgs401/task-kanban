import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BoardNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center">
      <h1 className="text-2xl font-bold">Board not found</h1>
      <p className="text-muted-foreground">
        This board doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to boards</Link>
      </Button>
    </div>
  );
}
