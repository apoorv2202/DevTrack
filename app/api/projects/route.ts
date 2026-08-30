import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const USERS = [
  { id: "u1", name: "Apoorv Malhotra", role: "Admin" },
  { id: "u2", name: "Rahul Sharma", role: "Developer" },
  { id: "u3", name: "Priya Nair", role: "Developer" },
  { id: "u4", name: "Aman Verma", role: "QA" },
];

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("devtrack_user")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: Missing user session." }, { status: 401 });
    }
    const user = USERS.find(u => u.id === userId);
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden: Only ADMIN users can create projects." }, { status: 403 });
    }

    const data = await req.json();
    const { name, key, lead, status, repoUrl } = data;
    if (!name || !key) {
      return NextResponse.json({ error: "Project name and key are required." }, { status: 400 });
    }

    const newProject = {
      id: "p" + Date.now(),
      name,
      key,
      desc: data.desc || "",
      lead: lead || "",
      status: status || "Active",
      repoUrl: repoUrl || "",
      health: 100, open: 0, critical: 0, team: [userId], velocity: 0, resTime: 0, backlog: 0, aging: 0, workload: 0
    };

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
