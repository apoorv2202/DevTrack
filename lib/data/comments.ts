"use server";
import { createClient } from "@/lib/supabase/server";

export async function getComments(issueId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("comments")
    .select("*, author:profiles!comments_author_id_fkey(id, username, full_name)")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true });
  if (error) { console.error("Error fetching comments:", error); return []; }
  return data;
}

export async function createComment(issueId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data, error } = await supabase.from("comments")
    .insert({
      issue_id: issueId,
      author_id: user.id,
      content
    })
    .select()
    .single();

  if (!error) { await supabase.from("activities").insert({ issue_id: issueId, actor_id: user.id, action: "commented" }); }
  return { data, error: error?.message };
}
