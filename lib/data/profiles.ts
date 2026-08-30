"use server";

import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null };

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orgMember, error: oErr } = await supabase
    .from("organization_members")
    .select("organization_id, role, status, employee_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Fetch org name separately to avoid RLS join issues
  let orgData: { name?: string } | null = null;
  if (orgMember?.organization_id) {
    const { data } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgMember.organization_id)
      .maybeSingle();
    orgData = data;
  }

  const orgMemberWithOrg = orgMember ? { ...orgMember, organizations: orgData } : null;

  return { user, profile, orgMember: orgMemberWithOrg };
}

export async function getPendingVerifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // get current user's org
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!orgMember || (orgMember.role !== 'admin' && orgMember.role !== 'owner')) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id, status, employee_id, role, profiles!organization_members_user_id_fkey(full_name, username)")
    .eq("organization_id", orgMember.organization_id)
    .eq("status", "pending");

  if (error) { console.error(error); return []; }
  return data;
}

export async function approveVerification(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ status: "active" })
    .eq("user_id", userId);
  return { error: error?.message };
}

export async function rejectVerification(userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ status: "rejected" })
    .eq("user_id", userId);
  return { error: error?.message };
}

export async function updateProfileName(fullName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  return { error: error?.message };
}

export async function updateOrganization(orgId: string, name: string, description: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("organizations").update({ name }).eq("id", orgId);
  return { error: error?.message };
}

export async function getTeamMembers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!orgMember) return [];

  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id, organization_id, status, employee_id, role, profiles!organization_members_user_id_fkey(id, full_name, username, avatar_url)")
    .eq("organization_id", orgMember.organization_id);

  if (error) { console.error(error); return []; }
  return data;
}
