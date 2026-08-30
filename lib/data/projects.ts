"use server";
import { createClient } from "@/lib/supabase/server";

export async function getProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return data;
}

export async function createProject(name: string, key: string, desc: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (!orgMember) return { error: "No organization found" };
  
  if (orgMember.role !== 'admin' && orgMember.role !== 'owner') {
    return { error: "You must be an admin to create a project." };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        key,
        description: desc,
        created_by: user.id,
        organization_id: orgMember.organization_id
      }
    ])
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}
