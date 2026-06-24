import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoardClient } from "./board-client";
import type { Board, Card } from "@/types/database.types";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!board) {
    notFound();
  }

  const { data: cards } = await supabase
    .from("cards")
    .select("*")
    .eq("board_id", params.id)
    .order("position", { ascending: true });

  return (
    <BoardClient
      board={board as Board}
      initialCards={(cards as Card[]) ?? []}
      userEmail={user.email ?? ""}
    />
  );
}
