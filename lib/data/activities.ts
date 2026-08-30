"use server";
import { createClient } from "@/lib/supabase/server";

export async function getActivities(issueId?: string) {
  const supabase = await createClient();
  let query = supabase.from("activities")
    .select("*, actor:profiles!activities_actor_id_fkey(id, username, full_name)")
    .order("created_at", { ascending: false });
    
  if (issueId) {
    query = query.eq("issue_id", issueId);
  } else {
    query = query.limit(20);
  }
  
  const { data, error } = await query;
  if (error) { console.error("Error fetching activities:", error); return []; }
  return data;
}
