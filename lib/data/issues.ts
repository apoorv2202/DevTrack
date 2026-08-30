"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";

export async function getIssueData() {
  const supabase = await createClient();

  // Load issues
  const { data: issues, error: issuesErr } = await supabase.from("issues").select(`
    *,
    project:projects(id, key),
    component:components(id, name),
    version:versions(id, name),
    milestone:milestones(id, name),
    assignee:profiles!issues_assignee_id_fkey(id, username, full_name),
    reporter:profiles!issues_reporter_id_fkey(id, username, full_name),
    issue_labels(label:labels(name)), ai_analyses(*)
  `).order("created_at", { ascending: false });
  if (issuesErr) console.error("Error fetching issues:", issuesErr);

  const { data: components, error: cErr } = await supabase.from("components").select("*");
  const { data: labels, error: lErr } = await supabase.from("labels").select("*");
  const { data: versions, error: vErr } = await supabase.from("versions").select("*");
  const { data: milestones, error: mErr } = await supabase.from("milestones").select("*");

  return { issues: issues || [], components: components || [], labels: labels || [], versions: versions || [], milestones: milestones || [] };
}

export async function createIssue(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };

  const { data: newIssue, error } = await supabase.from("issues").insert({
    project_id: data.project_id,
    title: data.title,
    description: data.description,
    priority: data.priority,
    severity: data.severity,
    status: data.status,
    reporter_id: user.id,
    assignee_id: data.assignee_id || null,
    component_id: data.component_id || null,
    version_id: data.version_id || null,
    milestone_id: data.milestone_id || null
  }).select().single();

  if (error) return { error: error.message };

  if (data.labels && data.labels.length > 0) {
    const { data: labelRecords } = await supabase.from("labels").select("*").in("name", data.labels);
    if (labelRecords && labelRecords.length > 0) {
      await supabase.from("issue_labels").insert(
        labelRecords.map((l: any) => ({ issue_id: newIssue.id, label_id: l.id }))
      );
    }
  }

  await supabase.from("activities").insert({ issue_id: newIssue.id, actor_id: user.id, action: "created" });
  return { data: newIssue };
}

export async function updateIssueStatus(issueId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("issues").update({ status }).eq("id", issueId);
  return { error: error?.message };
}
