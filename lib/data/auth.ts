"use server";

import { createClient } from "@/lib/supabase/server";

export async function login(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { data };
}

export async function register(email: string, password: string, fullName: string, org: string, empId: string, role: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options: { data: { full_name: fullName, organization: org, employee_id: empId, role: role || 'Developer' } } 
  });
  if (error) {
    if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
      return { error: "Too many verification emails have been requested. Please wait before trying again." };
    }
    return { error: error.message };
  }
  return { data };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  return { success: true };
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null };
  return { user };
}
