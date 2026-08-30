/* eslint-disable */


// @ts-nocheck
"use client";
import { login, register, logout, getUser } from "@/lib/data/auth";
import { getCurrentUserProfile, getTeamMembers } from "@/lib/data/profiles";
import { getProjects, createProject } from "@/lib/data/projects";
import { getIssueData, createIssue } from "@/lib/data/issues";
import { getComments, createComment } from "@/lib/data/comments";
import { getActivities } from "@/lib/data/activities";
import { createClient } from "@/lib/supabase/client";

import dynamic from 'next/dynamic';
const DevTrack3DHero = dynamic(() => import('../3d/DevTrack3DHero'), { ssr: false });
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  LayoutGrid, ListChecks, KanbanSquare, FolderKanban, BarChart3, Settings as SettingsIcon,
  Search, Bell, ChevronDown, Plus, X, Check, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft,
  Sparkles, AlertTriangle, Clock, GitPullRequest, MessageSquare, Paperclip, Upload, Trash2,
  CheckCircle2, Circle, ArrowUpRight, Link2, Users, User, Shield, Palette, Bug, Filter,
  MoreHorizontal, Star, Eye, TrendingUp, TrendingDown, Zap, GitBranch, Copy, ExternalLink,
  Menu, LogOut, Building2, Mail, Lock, IdCard, ImageIcon, CircleDot, ArrowUpCircle, Layers,
  Command, Home, ChevronUp, Loader2, Info, ShieldCheck, XCircle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";

/* ============================================================================
   DESIGN TOKENS
   ============================================================================ */
const T = {
  bg: "#0A0A0B",
  surface: "#141416",
  surface2: "#1B1B1E",
  surface3: "#222225",
  border: "#28282C",
  borderLight: "#333338",
  crimson: "#E3123F",
  crimsonBright: "#FF2C55",
  crimsonDim: "#8A0F2A",
  text: "#F3F2EF",
  textDim: "#98979E",
  textFaint: "#5D5C63",
  amber: "#E8A73C",
  green: "#3FBF7F",
  blue: "#4C8DE8",
  purple: "#9F7AEA",
};

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

    .devtrack-root, .devtrack-root * { box-sizing: border-box; }
    .devtrack-root {
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      background: ${T.bg};
      color: ${T.text};
      -webkit-font-smoothing: antialiased;
      position: relative;
      isolation: isolate; overflow-x: hidden;
    }
    .font-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

    .devtrack-root ::selection { background: ${T.crimson}; color: white; }

    .devtrack-root, .devtrack-root a, .devtrack-root button, .devtrack-root input,
    .devtrack-root textarea, .devtrack-root select, .devtrack-root [data-interactive] {
      cursor: none;
    }
    @media (pointer: coarse) {
      .devtrack-root, .devtrack-root * { cursor: auto !important; }
    }

    .dt-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
    .dt-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .dt-scrollbar::-webkit-scrollbar-thumb { background: ${T.borderLight}; border-radius: 8px; }
    .dt-scrollbar::-webkit-scrollbar-thumb:hover { background: ${T.crimsonDim}; }

    @keyframes dt-pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
    @keyframes dt-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes dt-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dt-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    @keyframes dt-glow-move { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
    @keyframes dt-spin { to { transform: rotate(360deg); } }
    .dt-anim-in { animation: dt-fade-up .35s cubic-bezier(.2,.7,.3,1) both; }
    .dt-fade { animation: dt-fade-in .25s ease both; }
    .dt-spin { animation: dt-spin 1s linear infinite; }

    .dt-card { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; transition: border-color .2s ease, transform .2s ease, background .2s ease; }
    .dt-card-hover:hover { border-color: ${T.borderLight}; }

    .dt-row { transition: background .15s ease; }
    .dt-row:hover { background: ${T.surface2}; }

    .dt-btn-primary {
      background: ${T.crimson}; color: white; font-weight: 600;
      transition: background .15s ease, transform .1s ease, box-shadow .2s ease;
      box-shadow: 0 0 0 0 rgba(227,18,63,0);
    }
    .dt-btn-primary:hover { background: ${T.crimsonBright}; box-shadow: 0 4px 24px -4px rgba(227,18,63,.45); }
    .dt-btn-primary:active { transform: scale(.97); }

    .dt-btn-ghost { background: transparent; border: 1px solid ${T.border}; color: ${T.text}; transition: all .15s ease; }
    .dt-btn-ghost:hover { border-color: ${T.borderLight}; background: ${T.surface2}; }

    .dt-nav-item { transition: background .15s ease, color .15s ease; position: relative; }
    .dt-nav-item:hover { background: ${T.surface2}; }
    .dt-nav-item.active { background: ${T.surface2}; color: ${T.text}; }
    .dt-nav-item.active::before {
      content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
      width: 3px; height: 60%; background: ${T.crimson}; border-radius: 0 3px 3px 0;
      box-shadow: 0 0 8px ${T.crimson};
    }

    .dt-input {
      background: ${T.surface2}; border: 1px solid ${T.border}; color: ${T.text};
      transition: border-color .15s ease, background .15s ease;
    }
    .dt-input::placeholder { color: ${T.textFaint}; }
    .dt-input:focus { outline: none; border-color: ${T.crimsonDim}; background: ${T.surface3}; }

    .dt-focusable:focus-visible {
      outline: 2px solid ${T.crimsonBright}; outline-offset: 2px; border-radius: 6px;
    }

    .dt-glow-text { text-shadow: 0 0 24px rgba(227,18,63,.35); }

    .dt-kbd {
      font-family: 'JetBrains Mono', monospace; font-size: 11px; background: ${T.surface3};
      border: 1px solid ${T.border}; border-bottom-width: 2px; border-radius: 5px; padding: 1px 5px; color: ${T.textDim};
    }

    .dt-drag-over { border-color: ${T.crimson} !important; background: rgba(227,18,63,.06) !important; }

    .dt-grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
      background-size: 42px 42px;
    }
  `}</style>
);

/* ============================================================================
   MOCK DATA
   ============================================================================ */
let USERS: any[] = [];
let meId = "u1";
let byId = (id: string) => USERS.find((u) => u?.id === id);

let PROJECTS: any[] = [];

let COMPONENTS: string[] = [];
let LABELS_ALL: string[] = [];
let VERSIONS: string[] = [];
let MILESTONES: string[] = [];

let ISSUES: any[] = [];
let ACTIVITIES: any[] = [];


function Avatar({ user, size = 28, onUpload }: any) {
  
  const initials = user?.initials || (user?.name || "U").substring(0, 2).toUpperCase();
  
  const [actualSrc, setActualSrc] = useState(user?.avatarUrl || user?.avatar_url);

  useEffect(() => {
    setActualSrc(user?.avatarUrl || user?.avatar_url);
  }, [user?.avatarUrl, user?.avatar_url]);

  
  const handleFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert("Please select a valid image file.");
    if (file.size > 5 * 1024 * 1024) return alert("Please select an image file under 5MB.");
    
    // Optimistic UI update
    const localUrl = URL.createObjectURL(file);
    if (user) user.avatarUrl = localUrl;
    setActualSrc(localUrl);

    const res = await uploadAvatarToSupabase(file);
    if (res.error) {
      alert(res.error);
    } else if (res.url) {
      if (user) user.avatarUrl = res.url;
      setActualSrc(res.url);
      if (onUpload) onUpload(res.url);
    }
    e.target.value = null;
  };
  return (
    <div
      title={isMe ? "Change profile photo" : user?.name}
      
      className={`rounded-full flex items-center justify-center font-semibold font-mono shrink-0 relative overflow-hidden group ${isMe ? 'cursor-pointer dt-focusable' : ''}`}
      style={{ width: size, height: size, background: `${user?.color}22`, color: user?.color, fontSize: size * 0.38, border: `1px solid ${user?.color}44` }}
      data-interactive={isMe ? true : undefined}
      role={isMe ? "button" : undefined}
      aria-label={isMe ? "Change profile photo" : undefined}
      tabIndex={isMe ? 0 : undefined}
    >
      {isMe && (
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      )}
      {actualSrc ? (
        <img src={actualSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
      {isMe && (
        <div className="absolute inset-0 bg-black/50 opacity-100 flex flex-col items-center justify-center transition-opacity z-10" style={{ fontSize: Math.max(10, size * 0.25) }}>
          <span style={{ fontSize: size > 40 ? size * 0.3 : size * 0.4 }}>📷</span>
          {size > 40 && <span className="text-white mt-1 leading-tight text-center px-1">Change<br/>photo</span>}
        </div>
      )}
      {user?.status === "online" && !isMe && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2" style={{ background: T.green, borderColor: T.surface }} />
      )}
    </div>
  );
}
function Button({ children, variant = "ghost", className = "", icon: Icon, ...props }: any) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium select-none dt-focusable";
  const cls = variant === "primary" ? "dt-btn-primary" : "dt-btn-ghost";
  return (
    <button className={`${base} ${cls} ${className}`} data-interactive {...props}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
function Labels({ items }: any) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((l: any) => (
        <span key={l} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: T.surface3, color: T.textDim, border: `1px solid ${T.border}` }}>
          {l}
        </span>
      ))}
    </div>
  );
}
function SectionLabel({ children }: any) {
  return <div className="text-[11px] font-mono uppercase tracking-[0.12em] mb-3" style={{ color: T.textFaint }}>{children}</div>;
}

/* ============================================================================
   AI SUGGESTION ENGINE (mock, deterministic on keywords)
   ============================================================================ */
function suggestFromText(text: string) {
  const t = (text || "").toLowerCase();
  let component = "Navigation", severity = "MEDIUM", priority = "P2", labels = ["ui"];
  if (t.includes("coupon") || t.includes("checkout") || t.includes("payment") || t.includes("card")) {
    component = "Payments"; severity = "CRITICAL"; priority = "P0"; labels = ["checkout", "payments", "production"];
  } else if (t.includes("oauth") || t.includes("login") || t.includes("auth")) {
    component = "Auth"; severity = "HIGH"; priority = "P1"; labels = ["oauth", "security"];
  } else if (t.includes("slow") || t.includes("performance") || t.includes("lag")) {
    component = "Navigation"; severity = "MEDIUM"; priority = "P2"; labels = ["performance"];
  } else if (t.includes("crash")) {
    component = "Payments"; severity = "CRITICAL"; priority = "P0"; labels = ["production", "regression"];
  }
  return { component, severity, priority, labels };
}
function findDuplicate(text: string) {
  const t = (text || "").toLowerCase();
  if (t.includes("oauth") && (t.includes("cancel") || t.includes("google") || t.includes("login"))) {
    return { key: "BUG-187", title: "Google OAuth crashes when login is cancelled", similarity: 92, created: "2 days ago", status: "IN PROGRESS", assignee: "u2" };
  }
  if (t.includes("coupon") || (t.includes("checkout") && t.includes("crash"))) {
    return { key: "BUG-201", title: "Checkout crashes when applying coupon", similarity: 88, created: "5 hours ago", status: "IN PROGRESS", assignee: "u2" };
  }
  return null;
}

/* ============================================================================
   APP SHELL: SIDEBAR + TOPBAR
   ============================================================================ */
const NAV_MAIN = [
  { id: "dashboard", label: "Overview", icon: Home },
  { id: "issues", label: "Issues", icon: ListChecks },
  { id: "board", label: "Board", icon: KanbanSquare },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];
const NAV_PERSONAL = [
  { id: "my-issues", label: "My Issues", icon: User },
  { id: "assigned", label: "Assigned to Me", icon: CheckCircle2 },
  { id: "recent", label: "Recently Viewed", icon: Eye },
];

function Sidebar({ view, setView, mobileOpen, setMobileOpen }: any) {
  const Content = (
    <div className="h-full flex flex-col" style={{ background: T.surface, borderRight: `1px solid ${T.border}` }}>
      <div className="h-16 flex items-center gap-2.5 px-5 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: T.crimson, boxShadow: `0 0 16px -2px ${T.crimson}` }}>
          <Bug size={15} color="white" />
        </div>
        <span className="font-display font-bold text-[15px] tracking-tight">DEVTRACK</span>
        <button className="ml-auto md:hidden dt-focusable" onClick={() => setMobileOpen(false)} data-interactive aria-label="Close menu">
          <X size={18} color={T.textDim} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto dt-scrollbar py-4 px-3">
        <div className="mb-5">
          {NAV_MAIN.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setMobileOpen(false); }}
              className={`dt-nav-item dt-focusable w-full flex items-center gap-2.5 rounded-lg px-3 py-3 md:py-2 text-[13px] font-medium mb-0.5 ${view === item.id ? "active" : ""}`}
              style={{ color: view === item.id ? T.text : T.textDim }}
              data-interactive
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <SectionLabel>Personal</SectionLabel>
        <div className="mb-5">
          {NAV_PERSONAL.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setMobileOpen(false); }}
              className={`dt-nav-item dt-focusable w-full flex items-center gap-2.5 rounded-lg px-3 py-3 md:py-2 text-[13px] font-medium mb-0.5 ${view === item.id ? "active" : ""}`}
              style={{ color: view === item.id ? T.text : T.textDim }}
              data-interactive
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>
        <SectionLabel>Team</SectionLabel>
        <button
          onClick={() => { setView("team"); setMobileOpen(false); }}
          className={`dt-nav-item dt-focusable w-full flex items-center gap-2.5 rounded-lg px-3 py-3 md:py-2 text-[13px] font-medium mb-0.5 ${view === "team" ? "active" : ""}`}
          style={{ color: view === "team" ? T.text : T.textDim }}
          data-interactive
        >
          <Users size={16} /> Team
        </button>
        {(byId(meId) as any)?.role?.toLowerCase() === "owner" || (byId(meId) as any)?.role?.toLowerCase() === "admin" ? (
          <button
            onClick={() => { setView("verification"); setMobileOpen(false); }}
            className={`dt-nav-item dt-focusable w-full flex items-center gap-2.5 rounded-lg px-3 py-3 md:py-2 text-[13px] font-medium mb-0.5 ${view === "verification" ? "active" : ""}`}
            style={{ color: view === "verification" ? T.text : T.textDim }}
            data-interactive
          >
            <Shield size={16} /> Verification
          </button>
        ) : null}
      </nav>

      <div className="p-3 shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={() => { setView("settings"); setMobileOpen(false); }}
          className="dt-nav-item dt-focusable w-full flex items-center gap-2.5 rounded-lg px-3 py-3 md:py-2 text-[13px] font-medium mb-2"
          style={{ color: view === "settings" ? T.text : T.textDim }}
          data-interactive
        >
          <SettingsIcon size={16} /> Settings
        </button>
        <div onClick={() => { setView("settings"); setMobileOpen(false); }} className="flex items-center gap-2.5 rounded-lg px-2 py-2 group cursor-pointer hover:bg-white/5 transition-colors" style={{ background: T.surface2 }}>
          <Avatar user={byId(meId) as any} size={30} />
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-medium truncate" style={{ color: T.text }}>{(byId(meId) as any)?.name}</div>
            <div className="text-[11px] truncate" style={{ color: T.textFaint }}>{(byId(meId) as any)?.email}</div>
            <div className="text-[11px] truncate flex items-center gap-1 mt-0.5 capitalize" style={{ color: T.textDim }}>
              {(byId(meId) as any)?.role} <span className="mx-1 opacity-50">�</span> <Building2 size={10} /> {(byId(meId) as any)?.orgName}
            </div>
          </div>
          <button onClick={async (e) => { e.stopPropagation(); await logout(); window.location.reload(); }} className="p-1.5 rounded text-red-500 hover:bg-red-500/10 opacity-100 transition-opacity dt-focusable" title="Log out"><LogOut size={14} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden md:block w-[240px] shrink-0 h-full">{Content}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden dt-fade">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]">{Content}</div>
        </div>
      )}
    </>
  );
}

function Topbar({ setMobileOpen, openSearch, view, setView }: any) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const unread = 0;
  return (
    <div className="flex flex-col sm:flex-row sm:h-16 px-4 md:px-6 shrink-0 relative py-2 sm:py-0 gap-2 sm:gap-3 z-20" style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(10,10,11,.9)", backdropFilter: "blur(8px)" }}>
      {/* Top row on mobile, left on desktop */}
      <div className="flex items-center justify-between w-full sm:w-auto shrink-0 h-12 sm:h-auto">
        <div className="flex items-center gap-3">
          <button className="md:hidden dt-focusable p-1 -ml-1" onClick={() => setMobileOpen(true)} data-interactive aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span className="sm:hidden font-display font-bold text-[15px] tracking-tight">DEVTRACK</span>
        </div>
        
        {/* On mobile, icons move here. On desktop, they are on the right */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            className="relative w-9 h-9 rounded-lg flex items-center justify-center dt-btn-ghost dt-focusable"
            onClick={() => setNotifOpen((v) => !v)}
            data-interactive
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: T.crimsonBright, boxShadow: `0 0 6px ${T.crimson}` }} />}
          </button>
          <button onClick={() => setView("settings")} data-interactive className="dt-focusable">
            <Avatar user={byId(meId) as any} size={28} />
          </button>
        </div>
      </div>

      <button
        onClick={openSearch}
        className="dt-input dt-focusable flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-[13px] w-full sm:flex-1 sm:max-w-md"
        style={{ color: T.textFaint }}
        data-interactive
      >
        <Search size={15} />
        <span className="hidden sm:inline">Search issues, projects, people...</span>
        <span className="sm:hidden">Search...</span>
        <span className="ml-auto hidden sm:flex items-center gap-1">
          <span className="dt-kbd">⌘</span><span className="dt-kbd">K</span>
        </span>
      </button>

      <div className="ml-auto hidden sm:flex items-center gap-1.5">
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center dt-btn-ghost dt-focusable"
          onClick={() => setNotifOpen((v) => !v)}
          data-interactive
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: T.crimsonBright, boxShadow: `0 0 6px ${T.crimson}` }} />}
        </button>
        {notifOpen && (
          <div className="absolute right-4 sm:right-40 top-24 sm:top-14 w-80 rounded-xl overflow-hidden dt-fade z-40" style={{ background: T.surface2, border: `1px solid ${T.border}`, boxShadow: "0 20px 48px -8px rgba(0,0,0,.6)" }}>
            <div className="px-4 py-3 text-[12px] font-semibold flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
              Notifications <span style={{ color: T.textFaint }} className="font-normal">{unread} unread</span>
            </div>
            <div className="max-h-80 overflow-y-auto dt-scrollbar">
              <div className="p-6 text-center text-[12.5px]" style={{ color: T.textDim }}>No recent notifications</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setOrgOpen((v) => !v)}
          className="hidden sm:flex items-center gap-2 dt-btn-ghost dt-focusable rounded-lg px-3 py-2 text-[12.5px]"
          data-interactive
        >
          <Building2 size={14} /> {(byId(meId) as any)?.orgName || "DevTrack"} <ChevronDown size={13} />
        </button>
        <button onClick={() => setView("settings")} data-interactive className="dt-focusable">
          <Avatar user={byId(meId) as any} size={32} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   COMMAND PALETTE
   ============================================================================ */
function CommandPalette({ open, onClose, onNavigateIssue, onNavigateProject, setView }: any) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => (inputRef.current as any)?.focus(), 30); }, [open]);
  useEffect(() => {
    const h = (e: any) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  const query = q.toLowerCase();
  const issueResults = query ? ISSUES.filter((i) => i.key.toLowerCase().includes(query) || i.title.toLowerCase().includes(query)).slice(0, 5) : ISSUES.slice(0, 3);
  const projectResults = query ? PROJECTS.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 3) : PROJECTS.slice(0, 2);
  const peopleResults = query ? USERS.filter((u) => (u?.name || "").toLowerCase().includes(query)).slice(0, 3) : USERS.slice(0, 2);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 dt-fade" style={{ background: "rgba(0,0,0,.65)" }} onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl overflow-hidden dt-anim-in" style={{ background: T.surface2, border: `1px solid ${T.borderLight}`, boxShadow: "0 32px 80px -16px rgba(0,0,0,.7)" }} onClick={(e: any) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Search size={16} color={T.textFaint} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
            placeholder="Search BUG-201, checkout, Rahul, E-Commerce..."
            className="flex-1 bg-transparent outline-none text-[14px]"
            style={{ color: T.text }}
          />
          <button onClick={onClose} className="dt-kbd" data-interactive>ESC</button>
        </div>
        <div className="max-h-96 overflow-y-auto dt-scrollbar py-2">
          {issueResults.length > 0 && (
            <div className="px-2 mb-1">
              <div className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-1.5" style={{ color: T.textFaint }}>Issues</div>
              {issueResults.map((i) => (
                <button key={i.key} onClick={() => { onNavigateIssue(i.key); onClose(); }} className="dt-row dt-focusable w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left" data-interactive>
                  <span className="font-mono text-[11px] w-16 shrink-0" style={{ color: T.textFaint }}>{i.key}</span>
                  <span className="text-[13px] truncate flex-1">{i.title}</span>
                  <PriorityBadge p={i.priority} />
                </button>
              ))}
            </div>
          )}
          {projectResults.length > 0 && (
            <div className="px-2 mb-1">
              <div className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-1.5" style={{ color: T.textFaint }}>Projects</div>
              {projectResults.map((p) => (
                <button key={p.id} onClick={() => { onNavigateProject(p.id); onClose(); }} className="dt-row dt-focusable w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left" data-interactive>
                  <FolderKanban size={14} color={T.textDim} />
                  <span className="text-[13px]">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          {peopleResults.length > 0 && (
            <div className="px-2">
              <div className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-1.5" style={{ color: T.textFaint }}>People</div>
              {peopleResults.map((u) => (
                <button key={u?.id} onClick={() => { setView("team"); onClose(); }} className="dt-row dt-focusable w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left" data-interactive>
                  <Avatar user={u} size={22} />
                  <span className="text-[13px]">{u?.name}</span>
                  <span className="ml-auto text-[11px]" style={{ color: T.textFaint }}>{u?.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   METRIC CARD / CHART CARD
   ============================================================================ */
function MetricCard({ label, value, trend, trendUp, icon: Icon, accent }: any) {
  return (
    <div className="dt-card dt-card-hover p-4 sm:p-5 dt-anim-in relative overflow-hidden">
      {accent && <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${T.crimson}, transparent)` }} />}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: T.textFaint }}>{label}</span>
        {Icon && <Icon size={15} color={accent ? T.crimsonBright : T.textFaint} />}
      </div>
      <div className="font-display text-[28px] font-bold leading-none mb-2">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 text-[11.5px]" style={{ color: trendUp ? T.green : T.textDim }}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {trend}
        </div>
      )}
    </div>
  );
}
function ChartCard({ title, subtitle, children, className = "" }: any) {
  return (
    <div className={`dt-card p-5 dt-anim-in ${className}`}>
      <div className="mb-4">
        <div className="text-[13px] font-semibold">{title}</div>
        {subtitle && <div className="text-[11.5px]" style={{ color: T.textFaint }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
const chartTooltipStyle = { background: T.surface3, border: `1px solid ${T.borderLight}`, borderRadius: 8, fontSize: 12, color: T.text };

/* ============================================================================
   LANDING PAGE
   ============================================================================ */
function LandingPage({ goApp, goLogin }: any) {
  const glowRef = useRef(null);
  useEffect(() => {
    const move = (e: any) => {
      if (glowRef.current) {
        (glowRef.current as any).style.background = `radial-gradient(600px circle at ${e.clientX}px ${e.clientY - 0}px, rgba(227,18,63,.10), transparent 40%)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  const features = [
    { icon: Sparkles, title: "SMART TRIAGE", desc: "DevTrack reads a bug description and instantly suggests component, severity, priority and labels — you stay in control of every call." },
    { icon: Copy, title: "DUPLICATE DETECTION", desc: "Before a new issue is filed, DevTrack checks it against your existing backlog for semantic overlap and flags likely duplicates." },
    { icon: MessageSquare, title: "DEVELOPER COLLABORATION", desc: "Threaded comments, linked pull requests and a live activity timeline keep the whole team aligned on every issue." },
    { icon: BarChart3, title: "ENGINEERING ANALYTICS", desc: "Resolution time, aging backlog and team workload roll up into a single engineering health score per project." },
  ];
  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text }}>
      <div ref={glowRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10">
        <div className="flex items-center justify-between px-6 md:px-10 h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: T.crimson, boxShadow: `0 0 16px -2px ${T.crimson}` }}>
              <Bug size={15} color="white" />
            </div>
            <span className="font-display font-bold text-[16px] tracking-tight">DEVTRACK</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={goLogin} className="text-[13px] font-medium dt-focusable" style={{ color: T.textDim }} data-interactive>Sign in</button>
            <Button variant="primary" onClick={goApp}>Get Started</Button>
          </div>
        </div>

        <div className="dt-grid-bg relative overflow-hidden">
          <DevTrack3DHero />
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(227,18,63,.14), transparent 70%)` }} />
          <div className="max-w-5xl mx-auto px-6 pt-32 pb-40 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11.5px] font-mono mb-8 dt-anim-in" style={{ background: T.surface2, border: `1px solid ${T.border}`, color: T.textDim }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.crimsonBright, boxShadow: `0 0 6px ${T.crimson}` }} />
              Built for Track 2 — Developer Tool Reconstruction
            </div>
            <h1 className="font-display font-bold tracking-tight text-[42px] sm:text-[58px] leading-[1.05] mb-6 dt-anim-in dt-glow-text" style={{ animationDelay: ".05s" }}>
              Ship better software.<br />Resolve issues intelligently.
            </h1>
            <p className="text-[16px] sm:text-[18px] max-w-xl mx-auto mb-10 dt-anim-in" style={{ color: T.textDim, animationDelay: ".1s" }}>
              Track bugs, collaborate with your engineering team, and understand project health from one intelligent workspace.
            </p>
            <div className="flex items-center justify-center gap-3 dt-anim-in" style={{ animationDelay: ".15s" }}>
              <Button variant="primary" onClick={goApp} className="px-6 py-3.5 text-[15px]">Get Started <ArrowRight size={16} /></Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-24">
          <SectionLabel>THE MODERN BUG WORKFLOW</SectionLabel>
          <h2 className="font-display font-bold text-[28px] sm:text-[34px] mb-14 max-w-2xl">A workflow that reasons alongside your team, not around it.</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f) => (
              <div key={f.title} className="dt-card dt-card-hover p-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(227,18,63,.12)", border: `1px solid ${T.crimsonDim}` }}>
                  <f.icon size={18} color={T.crimsonBright} />
                </div>
                <div className="text-[12px] font-mono tracking-wider mb-2" style={{ color: T.crimsonBright }}>{f.title}</div>
                <p className="text-[14px] leading-relaxed" style={{ color: T.textDim }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 pb-28 text-center">
          <h2 className="font-display font-bold text-[28px] mb-4">Bring order to your backlog.</h2>
          <p className="text-[15px] mb-8" style={{ color: T.textDim }}>Set up your workspace in minutes. No credit card required.</p>
          <Button variant="primary" onClick={goApp} className="px-6 py-3 text-[14px] mx-auto">Get Started <ArrowRight size={15} /></Button>
        </div>

        <div className="px-6 py-8 text-center text-[12px]" style={{ borderTop: `1px solid ${T.border}`, color: T.textFaint }}>
          DevTrack — a hackathon prototype for Track 2: Developer Tool Reconstruction.
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   AUTH: LOGIN / REGISTER
   ============================================================================ */
function AuthShell({ children }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 dt-grid-bg relative" style={{ background: T.bg }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 20%, rgba(227,18,63,.12), transparent 70%)" }} />
      <div className="w-full max-w-md relative dt-anim-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: T.crimson, boxShadow: `0 0 16px -2px ${T.crimson}` }}>
            <Bug size={16} color="white" />
          </div>
          <span className="font-display font-bold text-[17px]">DEVTRACK</span>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }: any) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-medium mb-1.5" style={{ color: T.textDim }}>{label}</label>
      {children}
    </div>
  );
}
function TextField(props: any) {
  return <input {...props} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive />;
}



function LoginPage({ goRegister, goApp, goLanding }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false); isSubmitting.current = false;
    if (res.error) {
      setError(res.error);
    } else {
      goApp();
    }
  };

  return (
    <AuthShell>
      <div className="dt-card p-7 sm:p-8 relative">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl"><Loader2 className="animate-spin text-white" /></div>}
        <h1 className="font-display font-bold text-[22px] mb-1">Welcome back</h1>
        <p className="text-[13px] mb-6" style={{ color: T.textFaint }}>Sign in to your engineering workspace.</p>
        
        {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[12.5px]">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <TextField type="email" placeholder="you@company.com" required value={email} onChange={(e: any) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <TextField type="password" placeholder="••••••••" required value={password} onChange={(e: any) => setPassword(e.target.value)} />
          </Field>
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-[12.5px]" style={{ color: T.textDim }}>
              <input type="checkbox" data-interactive className="accent-current" style={{ accentColor: T.crimson }} /> Remember me
            </label>
            <button type="button" className="text-[12.5px] dt-focusable" style={{ color: T.crimsonBright }} data-interactive>Forgot password?</button>
          </div>
          <Button type="submit" variant="primary" className="w-full py-2.5 text-[13.5px]">Sign In</Button>
        </form>
        <div className="text-center mt-6 text-[13px]" style={{ color: T.textFaint }}>
          Don't have an account? <button type="button" onClick={goRegister} className="dt-focusable font-medium" style={{ color: T.crimsonBright }} data-interactive>Create account</button>
        </div>
      </div>
      <button onClick={goLanding} className="w-full text-center mt-5 text-[12.5px] dt-focusable" style={{ color: T.textFaint }} data-interactive>← Back to home</button>
    </AuthShell>
  );
}

function RegisterPage({ goLogin, goLanding }: any) {
  const [file, setFile] = useState<any>(null);
  const [drag, setDrag] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Developer");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successText, setSuccessText] = useState("");
  const isSubmitting = useRef(false);

  const onDrop = (e: any) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      isSubmitting.current = false;
      return;
    }
    setLoading(true);
    const res = await register(email, password, fullName, org, empId, role);
    if (res.error) {
      setError(res.error);
      setLoading(false); isSubmitting.current = false;
    } else if (res.data?.user?.identities && res.data.user.identities.length === 0) {
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false); isSubmitting.current = false;
    } else {
      if (!res.data?.session) {
        // Email confirmation is required, so there is no active session yet.
        // We CANNOT upload the document due to RLS.
        setError("");
        setSuccessText("Account created. Please verify your email, then sign in to complete identity verification.");
        setLoading(false);
        isSubmitting.current = false;
        return;
      }

      // If we have a session, double check the authenticated user
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Account created, but no authenticated session found. Please sign in to upload your document.");
        setLoading(false);
        isSubmitting.current = false;
        return;
      }

      if (file) {
        try {
          const ext = file.name.split('.').pop();
          const safeFileName = `id-document-${Date.now()}.${ext}`;
          const path = `${user.id}/${safeFileName}`;
          const { error: uploadErr } = await supabase.storage.from("verification_documents").upload(path, file);
          
          if (uploadErr) {
            console.error("Storage upload failed:", uploadErr);
            setError("Document upload failed: " + uploadErr.message);
            setLoading(false);
            isSubmitting.current = false;
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      setLoading(false);
      setSuccessText("Identity verification submitted.\nYour organization administrator will review your request.");
      isSubmitting.current = false;
    }
  };

  return (
    <AuthShell>
      <div className="dt-card p-7 sm:p-8 relative">
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-xl"><Loader2 className="animate-spin text-white" /></div>}
        <h1 className="font-display font-bold text-[22px] mb-1">Create your account</h1>
        <p className="text-[13px] mb-6" style={{ color: T.textFaint }}>Join your organization's engineering workspace.</p>
        
        {error && <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[12.5px]">{error}</div>}
        {successText && <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-[12.5px] whitespace-pre-line">{successText}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name"><TextField placeholder="Jane Doe" required value={fullName} onChange={(e: any) => setFullName(e.target.value)} /></Field>
            <Field label="Organization"><TextField placeholder="Acme Inc." required value={org} onChange={(e: any) => setOrg(e.target.value)} /></Field>
          </div>
          <Field label="Role in Organization">
            <select className="dt-input w-full rounded-lg px-3.5 py-2.5 text-[13.5px] dt-focusable" data-interactive value={role} onChange={(e: any) => setRole(e.target.value)} required>
              <option value="Developer">Developer</option>
              <option value="QA">QA</option>
            </select>
          </Field>
          <Field label="Organization Email"><TextField type="email" placeholder="jane@acme.com" required value={email} onChange={(e: any) => setEmail(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee ID"><TextField placeholder="ACME-2026-0001" required value={empId} onChange={(e: any) => setEmpId(e.target.value)} /></Field>
            <Field label="Password"><TextField type="password" placeholder="••••••••" required value={password} onChange={(e: any) => setPassword(e.target.value)} /></Field>
          </div>
          <Field label="Confirm Password"><TextField type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} /></Field>

          <Field label="Identity Verification">
            <div
              onDragOver={(e: any) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={`rounded-lg border-2 border-dashed p-5 text-center transition-colors ${drag ? "dt-drag-over" : ""}`}
              style={{ borderColor: T.border }}
            >
              {!file ? (
                <>
                  <Upload size={20} className="mx-auto mb-2" color={T.textFaint} />
                  <div className="text-[12.5px] mb-2" style={{ color: T.textDim }}>Drag and drop your Employee ID Card, or</div>
                  <label className="dt-btn-ghost dt-focusable inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] cursor-pointer" data-interactive>
                    <IdCard size={14} /> Browse file
                    <input type="file" accept="image/*" className="hidden" onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </>
              ) : (
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: T.surface3 }}>
                    <ImageIcon size={18} color={T.textDim} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] truncate">{file.name}</div>
                    <div className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: T.amber }}><Clock size={11} /> Verification pending</div>
                  </div>
                  <button type="button" onClick={() => setFile(null)} data-interactive className="dt-focusable" aria-label="Remove file"><Trash2 size={15} color={T.textFaint} /></button>
                </div>
              )}
            </div>
            <p className="text-[11.5px] mt-2 leading-relaxed" style={{ color: T.textFaint }}>
              Your organization administrator will verify your identity before you can access the workspace.
            </p>
          </Field>

          <Button type="submit" variant="primary" className="w-full py-2.5 text-[13.5px] mt-2" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</Button>
        </form>
        <div className="text-center mt-6 text-[13px]" style={{ color: T.textFaint }}>
          Already have an account? <button type="button" onClick={goLogin} className="dt-focusable font-medium" style={{ color: T.crimsonBright }} data-interactive>Sign in</button>
        </div>
      </div>
      <button onClick={goLanding} className="w-full text-center mt-5 text-[12.5px] dt-focusable" style={{ color: T.textFaint }} data-interactive>← Back to home</button>
    </AuthShell>
  );
}

/* ============================================================================
   DASHBOARD
   ============================================================================ */
function Dashboard({ goIssue, setView }: any) {
  const openCount = ISSUES.filter(i => i.status === "OPEN").length;
  const inProgCount = ISSUES.filter(i => i.status === "IN PROGRESS").length;
  const critCount = ISSUES.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const resCount = ISSUES.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length;

  const severityDist = [
    { name: "Critical", value: ISSUES.filter(i => i.severity === "CRITICAL").length, color: T.crimson },
    { name: "High", value: ISSUES.filter(i => i.severity === "HIGH").length, color: T.amber },
    { name: "Medium", value: ISSUES.filter(i => i.severity === "MEDIUM").length, color: T.blue },
    { name: "Low", value: ISSUES.filter(i => i.severity === "LOW").length, color: T.textDim },
  ].filter(d => d.value > 0);

  const createdVsResolved = ISSUES.length ? [{ d: "All", created: ISSUES.length, resolved: resCount }] : [];


  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto dt-fade">
      <div className="mb-8 dt-anim-in">
        <h1 className="font-display font-bold text-[24px] sm:text-[28px]">{(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good morning,";
            if (hour < 18) return "Good afternoon,";
            return "Good evening,";
          })()} {(byId(meId) as any)?.name || 'there'}</h1>
        <p className="text-[14px] mt-1" style={{ color: T.textDim }}>Here's what's happening across your engineering workspace.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <MetricCard label="Open Issues" value={openCount.toString()} trend="" icon={CircleDot} />
        <MetricCard label="In Progress" value={inProgCount.toString()} trend="" icon={Zap} />
        <MetricCard label="Critical" value={critCount.toString()} trend="" icon={AlertTriangle} accent />
        <MetricCard label="Resolved" value={resCount.toString()} trend="" icon={CheckCircle2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <div className="lg:col-span-2 dt-card p-5 dt-anim-in">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px] font-semibold">Recent Issues</div>
            <button onClick={() => setView("issues")} className="text-[12px] flex items-center gap-1 dt-focusable" style={{ color: T.crimsonBright }} data-interactive>
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-1">
            {ISSUES.slice(0, 4).map((i) => (
              <button key={i.key} onClick={() => goIssue(i.key)} className="dt-row dt-focusable w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left" data-interactive>
                <span className="font-mono text-[11px] w-16 shrink-0" style={{ color: T.textFaint }}>{i.key}</span>
                <span className="text-[13px] truncate flex-1">{i.title}</span>
                <PriorityBadge p={i.priority} />
                <span className="hidden sm:block"><SeverityBadge s={i.severity} /></span>
                <StatusBadge s={i.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="dt-card p-5 dt-anim-in">
          <div className="text-[14px] font-semibold mb-4">Project Health</div>
          <div className="space-y-4">
            {PROJECTS.map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                  <span>{p.name}</span>
                  <span className="font-mono font-semibold" style={{ color: p.health >= 80 ? T.green : p.health >= 60 ? T.amber : T.crimsonBright }}>{p.health}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.surface3 }}>
                  <div className="h-full rounded-full" style={{ width: `${p.health}%`, background: p.health >= 80 ? T.green : p.health >= 60 ? T.amber : T.crimson }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-5">
        <ChartCard title="Issues Created vs Resolved" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={createdVsResolved.length ? createdVsResolved : []}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.crimson} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.crimson} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={T.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={22} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="created" stroke={T.crimsonBright} fill="url(#gradCreated)" strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" stroke={T.green} fill="url(#gradResolved)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Severity Distribution" subtitle="Across all projects">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={severityDist.length ? severityDist : []} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3}>
                {severityDist.map((d, idx) => <Cell key={idx} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
            {severityDist.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]" style={{ color: T.textDim }}>
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
              </div>
            ))}
          </div>
        </ChartCard>
        <div className="dt-card p-5 dt-anim-in">
          <div className="text-[14px] font-semibold mb-4">Activity Feed</div>
          <div className="space-y-3.5">
            {ACTIVITIES.length > 0 ? ACTIVITIES.slice(0, 5).map((a: any, idx: number) => {
              const u = USERS.find((u: any) => u.id === a.actor_id);
              const issueKey = ISSUES.find((i: any) => i.id === a.issue_id)?.key || "Issue";
              const dateStr = new Date(a.created_at).toLocaleDateString();
              return (
              <div key={idx} className="flex items-start gap-2.5">
                <Avatar user={u} size={22} />
                <div className="text-[12.5px] leading-snug">
                  <span className="font-medium">{u?.name?.split(" ")[0] || a.actor?.full_name || "Unknown"}</span>{" "}
                  <span style={{ color: T.textDim }}>{a.action || a.action_type || "updated"}</span>{" "}
                  <span className="font-mono" style={{ color: T.crimsonBright }}>{issueKey}</span>
                  <div className="text-[11px] mt-0.5" style={{ color: T.textFaint }}>{dateStr}</div>
                </div>
              </div>
            )}) : <div className="text-center py-4 text-[12.5px]" style={{ color: T.textDim }}>No recent activity</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ISSUES LIST
   ============================================================================ */
function FilterChip({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      data-interactive
      className="dt-focusable px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors"
      style={{ background: active ? "rgba(227,18,63,.14)" : T.surface2, color: active ? T.crimsonBright : T.textDim, border: `1px solid ${active ? T.crimsonDim : T.border}` }}
    >
      {label}
    </button>
  );
}

function IssuesList({ goIssue, goCreate, presetFilter, title = "Issues", subtitle = "Track, prioritize and resolve engineering issues.", hideCreate }: any) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffect(() => {
    if (presetFilter === "recent") {
      try { setRecentIds(JSON.parse(localStorage.getItem("devtrack_recent_issues") || "[]")); } catch (e) {}
    }
  }, [presetFilter]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("updated");
  const [visibleCount, setVisibleCount] = useState(6);

  let filtered = ISSUES.filter((i) => {
    if (presetFilter === "assigned" && i.assignee !== meId) return false;
    if (presetFilter === "reported" && i.reporter !== meId) return false;
    const matchesSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.key.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || i.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  if (sortKey === "priority") filtered = [...filtered].sort((a, b) => a.priority.localeCompare(b.priority));
  if (sortKey === "key") filtered = [...filtered].sort((a, b) => a.key.localeCompare(b.key));

  const visible = filtered.slice(0, visibleCount);
  const statuses = ["ALL", "OPEN", "IN PROGRESS", "IN REVIEW", "RESOLVED", "CLOSED"];
  const priorities = ["ALL", "P0", "P1", "P2", "P3"];

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto dt-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[24px]">{title}</h1>
          <p className="text-[13.5px] mt-1" style={{ color: T.textDim }}>{subtitle}</p>
        </div>
        {!hideCreate && (
          <Button variant="primary" icon={Plus} onClick={goCreate}>
            {(byId(meId) as any)?.role?.toLowerCase() === "owner" || (byId(meId) as any)?.role?.toLowerCase() === "admin" ? "New Issue" : "Push Issue for Verification"}
          </Button>
        )}
      </div>

      <div className="dt-input rounded-lg flex items-center gap-2.5 px-3.5 py-2.5 mb-4">
        <Search size={15} color={T.textFaint} />
        <input
          value={search}
          onChange={(e: any) => { setSearch(e.target.value); setVisibleCount(6); }}
          placeholder="Search issues, titles, descriptions..."
          className="bg-transparent outline-none text-[13.5px] flex-1"
          style={{ color: T.text }}
          data-interactive
        />
      </div>

      <div className="flex items-center gap-2 mb-2 overflow-x-auto dt-scrollbar pb-2">
        <Filter size={13} color={T.textFaint} className="shrink-0" />
        {statuses.map((s) => <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => { setStatusFilter(s); setVisibleCount(6); }} />)}
      </div>
      <div className="flex items-center gap-2 mb-5 overflow-x-auto dt-scrollbar pb-1">
        <span className="w-[13px] shrink-0" />
        {priorities.map((p) => <FilterChip key={p} label={p} active={priorityFilter === p} onClick={() => { setPriorityFilter(p); setVisibleCount(6); }} />)}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-[11.5px]" style={{ color: T.textFaint }}>Sort</span>
          <select value={sortKey} onChange={(e: any) => setSortKey(e.target.value)} className="dt-input dt-focusable rounded-lg px-2 py-1.5 text-[12px]" data-interactive>
            <option value="updated">Recently updated</option>
            <option value="priority">Priority</option>
            <option value="key">Key</option>
          </select>
        </div>
      </div>

      <div className="dt-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[80px_1fr_120px_70px_100px_140px_180px_80px] gap-3 px-4 py-2.5 text-[10.5px] font-mono uppercase tracking-wider" style={{ borderBottom: `1px solid ${T.border}`, color: T.textFaint }}>
          <div>Key</div><div>Title</div><div>Status</div><div>Priority</div><div>Severity</div><div>Assignee</div><div>Labels</div><div>Updated</div>
        </div>
        {visible.length === 0 && (
          <div className="px-6 py-12 text-center text-[13px]" style={{ color: T.textFaint }}>No issues match your filters.</div>
        )}
        {visible.map((i) => (
          <button
            key={i.key}
            onClick={() => goIssue(i.key)}
            data-interactive
            className="dt-row dt-focusable w-full text-left grid grid-cols-2 md:grid-cols-[80px_1fr_120px_70px_100px_140px_180px_80px] gap-2 md:gap-3 px-4 py-3"
            style={{ borderBottom: `1px solid ${T.border}` }}
          >
            <div className="font-mono text-[11.5px]" style={{ color: T.textFaint }}>{i.key}</div>
            <div className="text-[13px] truncate col-span-2 md:col-span-1">{i.title}</div>
            <div className="md:block"><StatusBadge s={i.status} /></div>
            <div><PriorityBadge p={i.priority} /></div>
            <div className="hidden md:block"><SeverityBadge s={i.severity} /></div>
            <div className="hidden md:flex items-center gap-2"><Avatar user={byId(i.assignee)} size={20} /><span className="text-[12px] truncate">{(byId(i.assignee) as any)?.name?.split(" ")[0] || "Unassigned"}</span></div>
            <div className="hidden md:block"><Labels items={i.labels.slice(0, 2)} /></div>
            <div className="hidden md:block text-[11.5px]" style={{ color: T.textFaint }}>{i.updated}</div>
          </button>
        ))}
      </div>
      {visibleCount < filtered.length && (
        <div className="flex justify-center mt-5">
          <Button onClick={() => setVisibleCount((v) => v + 6)}>Load more ({filtered.length - visibleCount} remaining)</Button>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   INTELLIGENCE PANEL (shared by CreateIssue + IssueDetail)
   ============================================================================ */
function IntelligencePanel({ suggestion, onAccept, accepted }: any) {
  if (!suggestion) return null;
  return (
    <div className="dt-card p-4 relative overflow-hidden dt-anim-in" style={{ borderColor: T.crimsonDim }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(227,18,63,.14), transparent 70%)" }} />
      <div className="flex items-center gap-2 mb-3.5 relative">
        <Sparkles size={14} color={T.crimsonBright} />
        <span className="text-[11.5px] font-mono uppercase tracking-wider" style={{ color: T.crimsonBright }}>DevTrack Intelligence</span>
      </div>
      <div className="space-y-3 relative">
        <div>
          <div className="text-[10.5px]" style={{ color: T.textFaint }}>Suggested Component</div>
          <div className="text-[13.5px] font-medium">{suggestion?.component}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10.5px]" style={{ color: T.textFaint }}>Suggested Severity</div>
            <SeverityBadge s={suggestion?.severity} />
          </div>
          <div>
            <div className="text-[10.5px]" style={{ color: T.textFaint }}>Suggested Priority</div>
            <PriorityBadge p={suggestion?.priority} />
          </div>
        </div>
        <div>
          <div className="text-[10.5px] mb-1" style={{ color: T.textFaint }}>Suggested Labels</div>
          <Labels items={suggestion?.labels} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 relative">
        <Button variant="primary" className="flex-1 justify-center text-[12.5px] py-2" onClick={onAccept} disabled={accepted}>
          {accepted ? <><Check size={14} /> Accepted</> : "Accept Suggestions"}
        </Button>
        <Button className="text-[12.5px] py-2">Edit</Button>
      </div>
    </div>
  );
}

function DuplicatePanel({ dup, onView, onContinue, dismissed }: any) {
  if (!dup || dismissed) return null;
  return (
    <div className="dt-card p-4 dt-anim-in" style={{ borderColor: "rgba(232,167,60,.4)", background: "rgba(232,167,60,.05)" }}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={14} color={T.amber} />
        <span className="text-[11.5px] font-mono uppercase tracking-wider" style={{ color: T.amber }}>Possible Duplicate</span>
      </div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-mono text-[12px]" style={{ color: T.textFaint }}>{dup?.key}</div>
          <div className="text-[13.5px] font-medium mt-0.5">{dup?.title}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display font-bold text-[18px]" style={{ color: T.amber }}>{dup?.similarity}%</div>
          <div className="text-[10px]" style={{ color: T.textFaint }}>similarity</div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[11.5px] mb-4" style={{ color: T.textDim }}>
        <span>Created {dup?.created}</span>
        <span className="flex items-center gap-1"><StatusBadge s={dup?.status} /></span>
        <span className="flex items-center gap-1.5"><Avatar user={byId(dup?.assignee)} size={16} /> {byId(dup?.assignee)?.name?.split(" ")[0] || "Unassigned"}</span>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1 justify-center text-[12.5px] py-2" onClick={onView}>View Issue</Button>
        <Button className="flex-1 justify-center text-[12.5px] py-2" onClick={onContinue}>Continue Anyway</Button>
      </div>
      <p className="text-[10.5px] mt-3 leading-relaxed" style={{ color: T.textFaint }}>
        A modern implementation of duplicate prevention — matched against your existing backlog by semantic similarity.
      </p>
    </div>
  );
}

/* ============================================================================
   CREATE ISSUE
   ============================================================================ */
function CreateIssue({ onCreated, goIssues, goIssue }: any) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [dupDismissed, setDupDismissed] = useState(false);
  const [form, setForm] = useState({ project: PROJECTS[0]?.id || "", component: "", priority: "", severity: "", assignee: "", labels: [] as string[], version: "", targetVersion: "", milestone: "" });

  const suggestion = useMemo(() => (title || desc ? suggestFromText(title + " " + desc) : null), [title, desc]);
  const dup = useMemo(() => (title || desc ? findDuplicate(title + " " + desc) : null), [title, desc]);

  const acceptSuggestions = () => {
    setForm((f: any) => ({ ...f, component: suggestion?.component, priority: suggestion?.priority, severity: suggestion?.severity, labels: suggestion?.labels }));
    setAccepted(true);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    if (!form.project) { setError("Project is required"); return; }
    if (!form.priority) { setError("Priority is required"); return; }
    if (!form.severity) { setError("Severity is required"); return; }
    
    setLoading(true);
    setError("");
    const res = await createIssue({
      title,
      description: desc,
      project_id: form.project,
      component_id: form.component || null,
      priority: form.priority,
      severity: form.severity,
      status: ((byId(meId) as any)?.role?.toLowerCase() !== 'owner' && (byId(meId) as any)?.role?.toLowerCase() !== 'admin') ? "PENDING" : "OPEN",
      assignee_id: form.assignee || null,
      labels: form.labels,
      version_id: form.version || null,
      milestone_id: form.milestone || null
    });
    setLoading(false); isSubmitting.current = false;
    if (res.error) setError(res.error);
    else {
      const { getIssueData } = await import("@/lib/data/issues");
      const { issues, components, labels, versions, milestones } = await getIssueData();
      if (issues) {
          ISSUES = issues.map((i: any) => ({
            id: i.id,
            key: i.project ? `${i.project.key}-${i.issue_number || i.id.substring(0, 4).toUpperCase()}` : `BUG-${i.issue_number || 100}`,
            title: i.title,
            priority: i.priority,
            severity: i.severity,
            status: i.status,
            project: i.project?.id || "p1",
            component: i.component?.name || "",
            assignee: i.assignee?.id || null,
            reporter: i.reporter?.id || meId,
            labels: i.issue_labels ? i.issue_labels.map((il: any) => il.label?.name).filter(Boolean) : [],
            version: i.version?.name || "",
            milestone: i.milestone?.name || "",
            updated: "just now",
            created: "just now",
            description: i.description,
            aiRootCause: i.ai_analyses?.[0]?.summary || null,
            aiSuggestedComponent: i.ai_analyses?.[0]?.suggested_component_id || null,
            aiSuggestedPriority: i.ai_analyses?.[0]?.suggested_priority || null,
            aiSuggestedSeverity: i.ai_analyses?.[0]?.suggested_severity || null,
            aiConfidence: i.ai_analyses?.[0]?.confidence ? Math.round(i.ai_analyses[0].confidence * 100) : null,
            aiModel: i.ai_analyses?.[0]?.model || null
          }));
      }
      onCreated(ISSUES.find(x => x.id === res.data.id)?.key || ISSUES[0]?.key);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-[1200px] mx-auto dt-fade">
      <h1 className="font-display font-bold text-[24px] mb-1">{((byId(meId) as any)?.role?.toLowerCase() !== 'owner' && (byId(meId) as any)?.role?.toLowerCase() !== 'admin') ? "Push Issue for Verification" : "New Issue"}</h1>
      <p className="text-[13.5px] mb-6" style={{ color: T.textDim }}>Describe the problem � DevTrack Intelligence will help fill in the rest.</p>

      {error && (
        <div className="mb-6 p-3 rounded-lg text-[13px] font-medium" style={{ background: '#ff333322', color: '#ff4444', border: '1px solid #ff333344' }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <div className="dt-card p-5">
            <Field label="Title">
              <TextField value={title} onChange={(e: any) => setTitle(e.target.value)} placeholder="Checkout crashes when applying coupon" required />
            </Field>
            <Field label="Description">
              <textarea
                value={desc}
                onChange={(e: any) => setDesc(e.target.value)}
                placeholder="Production checkout crashes whenever a customer applies a coupon after entering card details."
                rows={5}
                className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px] resize-none"
                data-interactive
              />
            </Field>
          </div>

          <div className="dt-card p-5">
            <SectionLabel>Classification</SectionLabel>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Project">
                <select value={form.project} onChange={(e: any) => setForm({ ...form, project: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive required>
                  <option value="">Select project</option>
                  {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Component">
                <select value={form.component} onChange={(e: any) => setForm({ ...form, component: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive>
                  <option value="">Select component</option>
                  {COMPONENTS.map((c: any) => <option key={c.id || c} value={c.id || c}>{c.name || c}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={(e: any) => setForm({ ...form, priority: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive required>
                  <option value="">Select priority</option>
                  {["P0", "P1", "P2", "P3"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Severity">
                <select value={form.severity} onChange={(e: any) => setForm({ ...form, severity: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive required>
                  <option value="">Select severity</option>
                  {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Assignee">
                <select disabled={!((byId(meId) as any)?.role?.toLowerCase() === 'owner' || (byId(meId) as any)?.role?.toLowerCase() === 'admin')} value={form.assignee} onChange={(e: any) => setForm({ ...form, assignee: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive>
                  <option value="">Unassigned</option>
                  {USERS.filter(u => {
                    const r = u?.role?.toLowerCase() || "";
                    if (r === "owner") return false;
                    const myRole = (byId(meId) as any)?.role?.toLowerCase() || "";
                    if (r === "admin" && myRole !== "owner") return false;
                    return true;
                  }).map((u: any) => <option key={u?.id} value={u?.id}>{u?.name}</option>)}
                </select>
              </Field>
              <Field label="Affected Version">
                <select value={form.version} onChange={(e: any) => setForm({ ...form, version: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive>
                  <option value="">Select version</option>
                  {VERSIONS.map((v: any) => <option key={v.id || v} value={v.id || v}>{v.name || v}</option>)}
                </select>
              </Field>
              <Field label="Target Version">
                <select value={form.targetVersion} onChange={(e: any) => setForm({ ...form, targetVersion: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive>
                  <option value="">Select version</option>
                  {VERSIONS.map((v: any) => <option key={v.id || v} value={v.id || v}>{v.name || v}</option>)}
                </select>
              </Field>
              <Field label="Milestone">
                <select value={form.milestone} onChange={(e: any) => setForm({ ...form, milestone: e.target.value })} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13.5px]" data-interactive>
                  <option value="">Select milestone</option>
                  {MILESTONES.map((m: any) => <option key={m.id || m} value={m.id || m}>{m.name || m}</option>)}
                </select>
              </Field>
            </div>
            {form.labels.length > 0 && (
              <div className="mt-4"><div className="text-[12.5px] font-medium mb-1.5" style={{ color: T.textDim }}>Labels</div><Labels items={form.labels} /></div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="primary" className="px-5 py-2.5" type="submit" disabled={loading}>{loading ? "Creating..." : ((byId(meId) as any)?.role?.toLowerCase() !== 'owner' && (byId(meId) as any)?.role?.toLowerCase() !== 'admin') ? "Push Issue for Verification" : "Create Issue"}</Button>
            <Button type="button" onClick={() => goIssues()}>Cancel</Button>
          </div>
        </div>

        <div className="space-y-4">
          {suggestion ? <IntelligencePanel suggestion={suggestion} onAccept={acceptSuggestions} accepted={accepted} /> : (
            <div className="dt-card p-5 text-center">
              <Sparkles size={20} color={T.textFaint} className="mx-auto mb-2" />
              <p className="text-[12.5px]" style={{ color: T.textFaint }}>Start typing a title or description and DevTrack Intelligence will suggest classification here.</p>
            </div>
          )}
          <DuplicatePanel dup={dup} dismissed={dupDismissed} onView={() => goIssue(dup?.key)} onContinue={() => setDupDismissed(true)} />
        </div>
      </form>
    </div>
  );
}

/* ============================================================================
   ISSUE DETAIL
   ============================================================================ */
const TIMELINE_ICON = { create: Plus, assign: User, priority: ArrowUpCircle, comment: MessageSquare, pr: GitPullRequest, status: CircleDot };

function IssueDetail({ issueKey, goIssues, goIssue }: any) {
  const issue = ISSUES.find((i) => i.key === issueKey) || ISSUES[0];
  const [status, setStatus] = useState(issue.status);
  const updateStatus = async (newStatus: string) => {
    const { updateIssueStatus } = await import("@/lib/data/issues");
    setStatus(newStatus);
    issue.status = newStatus;
    await updateIssueStatus(issue.id, newStatus);
  };
  const [assignee, setAssignee] = useState(issue.assignee);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>(issue.comments || []);
  const [activities, setActivities] = useState<any[]>(issue.history || []);
  const statuses = ["OPEN", "IN PROGRESS", "IN REVIEW", "RESOLVED", "CLOSED"];
  const project = PROJECTS.find((p) => p.id === issue.project);

  useEffect(() => {
    // If the issue object has a real db 'id'
    if (issue.id) {
      getComments(issue.id).then(res => {
        if (res) {
          setComments(res.map(r => ({
            id: r.id,
            user: r.author?.id || meId,
            text: r.content,
            time: new Date().toLocaleDateString() // we can format properly later
          })));
        }
      });
      getActivities(issue.id).then(res => {
        if (res) {
          setActivities(res.map(r => ({
            id: r.id,
            type: (r.action || "").toUpperCase(),
            user: r.actor?.id || meId,
            to: r.new_value,
            time: new Date().toLocaleDateString()
          })));
        }
      });
    }
  }, [issue.id]);

  const addComment = async () => {
    if (!comment.trim()) return;
    if (issue.id) {
      const res = await createComment(issue.id, comment);
      if (res.data) {
        setComments((c: any) => [...c, { id: res.data.id, user: meId, text: comment, time: new Date().toLocaleDateString() }]);
      }
    } else {
      setComments((c: any) => [...c, { user: meId, text: comment, time: new Date().toLocaleDateString() }]);
    }
    setComment("");
  };

  return (
    <div className="p-5 md:p-8 max-w-[1300px] mx-auto dt-fade">
      <button onClick={goIssues} className="dt-focusable flex items-center gap-1.5 text-[12.5px] mb-4" style={{ color: T.textFaint }} data-interactive>
        <ArrowLeft size={14} /> Back to Issues
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <div className="font-mono text-[13px] mb-1.5" style={{ color: T.textFaint }}>{issue.key} · {project?.name}</div>
          <h1 className="font-display font-bold text-[22px] sm:text-[26px] mb-2 max-w-2xl">{issue.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge p={issue.priority} />
            <SeverityBadge s={issue.severity} />
            <StatusBadge s={status} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5 min-w-0">
          <div className="dt-card p-5">
            <SectionLabel>Description</SectionLabel>
            <p className="text-[13.5px] leading-relaxed" style={{ color: T.text }}>{issue.description}</p>
          </div>

          <div className="dt-card p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(circle at top right, rgba(227,18,63,.1), transparent 70%)" }} />
            <div className="flex items-center gap-2 mb-4 relative">
              <Sparkles size={14} color={T.crimsonBright} />
              <span className="text-[11.5px] font-mono uppercase tracking-wider" style={{ color: T.crimsonBright }}>AI Summary</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: T.surface3, color: T.textFaint }}>AI-generated</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 relative">
              <div>
                <div className="text-[10.5px] mb-1" style={{ color: T.textFaint }}>Root Cause</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: T.textDim }}>{issue.aiRootCause}</p>
              </div>
              <div>
                <div className="text-[10.5px] mb-1" style={{ color: T.textFaint }}>Potential Impact</div>
                <p className="text-[12.5px] leading-relaxed" style={{ color: T.textDim }}>{issue.aiImpact}</p>
              </div>
              <div>
                <div className="text-[10.5px] mb-1" style={{ color: T.textFaint }}>Suggested Component</div>
                <div className="text-[12.5px] font-medium">{issue.component}</div>
              </div>
              <div>
                <div className="text-[10.5px] mb-1" style={{ color: T.textFaint }}>Suggested Priority</div>
                <PriorityBadge p={issue.priority} />
              </div>
            </div>
          </div>

          {issue.relations.length > 0 && (
            <div className="dt-card p-5">
              <SectionLabel>Relationships</SectionLabel>
              <div className="space-y-2">
                {issue.relations.map((r: any, idx: number) => {
                  const target = ISSUES.find((x) => x.key === r.key);
                  return (
                    <button key={idx} onClick={() => goIssue(r.key)} data-interactive className="dt-row dt-focusable w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left" style={{ border: `1px solid ${T.border}` }}>
                      <Link2 size={13} color={T.textFaint} />
                      <span className="text-[11.5px] font-mono px-2 py-0.5 rounded" style={{ background: T.surface3, color: T.textDim }}>{r.type}</span>
                      <span className="font-mono text-[11.5px]" style={{ color: T.textFaint }}>{r.key}</span>
                      <span className="text-[12.5px] truncate flex-1">{target?.title}</span>
                      {target && <StatusBadge s={target.status} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="dt-card p-5">
            <SectionLabel>Activity Timeline</SectionLabel>
            <div className="space-y-0">
              {activities.map((t, idx) => {
                // Map db activity type to icon
                let iconKey = "status";
                if (t.type === "CREATED") iconKey = "create";
                if (t.type === "ASSIGNED") iconKey = "assign";
                if (t.type === "PRIORITY_CHANGED") iconKey = "priority";
                
                const Icon = TIMELINE_ICON[iconKey as keyof typeof TIMELINE_ICON] || CircleDot;
                return (
                  <div key={idx} className="flex gap-3 relative pb-5 last:pb-0">
                    {idx < activities.length - 1 && <div className="absolute left-[13px] top-6 bottom-0 w-px" style={{ background: T.border }} />}
                    <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 relative z-10" style={{ background: T.surface3, border: `1px solid ${T.border}` }}>
                      <Icon size={12} color={T.textDim} />
                    </div>
                    <div className="pt-0.5">
                      <div className="text-[12.5px]">{t.type} {t.to ? `to ${t.to}` : ""}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: T.textFaint }}>{t.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dt-card p-5">
            <SectionLabel>Comments</SectionLabel>
            <div className="space-y-4 mb-5">
              {comments.length === 0 && <p className="text-[12.5px]" style={{ color: T.textFaint }}>No comments yet.</p>}
              {comments.map((c, idx) => (
                <div key={idx} className="flex gap-3">
                  <Avatar user={byId(c.user)} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12.5px] font-medium">{(byId(c.user) as any)?.name || "Unknown User"}</span>
                      <span className="text-[11px]" style={{ color: T.textFaint }}>{c.time}</span>
                    </div>
                    <div className="text-[13px] rounded-lg rounded-tl-sm px-3.5 py-2.5" style={{ background: T.surface2, color: T.text }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Avatar user={byId(meId) as any} size={28} />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e: any) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13px] resize-none mb-2"
                  data-interactive
                />
                <Button variant="primary" onClick={addComment} className="py-1.5 px-3.5 text-[12.5px]">Comment</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="dt-card p-4">
            <SectionLabel>Details</SectionLabel>
            <div className="space-y-3.5">
              <div>
                <div className="text-[11px] mb-1.5" style={{ color: T.textFaint }}>Status</div>
                <select value={status} onChange={(e: any) => updateStatus(e.target.value)} className="dt-input dt-focusable w-full rounded-lg px-3 py-2 text-[12.5px]" data-interactive>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><div className="text-[11px] mb-1.5" style={{ color: T.textFaint }}>Priority</div><PriorityBadge p={issue.priority} /></div>
                <div><div className="text-[11px] mb-1.5" style={{ color: T.textFaint }}>Severity</div><SeverityBadge s={issue.severity} /></div>
              </div>
              <div>
                <div className="text-[11px] mb-1.5" style={{ color: T.textFaint }}>Assignee</div>
                <select disabled={!((byId(meId) as any)?.role?.toLowerCase() === 'owner' || (byId(meId) as any)?.role?.toLowerCase() === 'admin')} value={assignee} onChange={async (e: any) => {
                  const newAssignee = e.target.value;
                  setAssignee(newAssignee);
                  issue.assignee = newAssignee;
                  if (issue.id) {
                    const { createClient } = await import('@/lib/supabase/client');
                    const sb = createClient();
                    await sb.from('issues').update({ assignee_id: newAssignee || null }).eq('id', issue.id);
                  }
                }} className="dt-input dt-focusable w-full rounded-lg px-3 py-2 text-[12.5px]" data-interactive>
                  {USERS.filter(u => {
                    const r = u?.role?.toLowerCase() || "";
                    if (r === "owner") return false;
                    const myRole = (byId(meId) as any)?.role?.toLowerCase() || "";
                    if (r === "admin" && myRole !== "owner") return false;
                    return true;
                  }).map((u: any) => <option key={u?.id} value={u?.id}>{u?.name}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span style={{ color: T.textFaint }}>Reporter</span>
                <span className="flex items-center gap-1.5"><Avatar user={(byId(issue.reporter) as any)} size={18} /> {((byId(issue.reporter) as any))?.name?.split(" ")[0] || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]"><span style={{ color: T.textFaint }}>Project</span><span>{project?.name}</span></div>
              <div className="flex items-center justify-between text-[12.5px]"><span style={{ color: T.textFaint }}>Component</span><span>{issue.component}</span></div>
              <div className="flex items-center justify-between text-[12.5px]"><span style={{ color: T.textFaint }}>Version</span><span className="font-mono">{issue.version}</span></div>
              <div className="flex items-center justify-between text-[12.5px]"><span style={{ color: T.textFaint }}>Milestone</span><span>{issue.milestone}</span></div>
              <div>
                <div className="text-[11px] mb-1.5" style={{ color: T.textFaint }}>Labels</div>
                <Labels items={issue.labels} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   BOARD (Kanban)
   ============================================================================ */
function Board({ goIssue }: any) {
  const columns = ["OPEN", "IN PROGRESS", "IN REVIEW", "RESOLVED", "CLOSED"];
  const [issuesState, setIssuesState] = useState(ISSUES.map((i) => ({ ...i })));
  const [dragKey, setDragKey] = useState<any>(null);
  const [overCol, setOverCol] = useState<any>(null);

  const moveIssue = (key: string, col: string) => {
    setIssuesState((prev) => prev.map((i) => (i.key === key ? { ...i, status: col } : i)));
  };

  return (
    <div className="p-5 md:p-8 max-w-[1500px] mx-auto dt-fade">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-[24px]">Board</h1>
          <p className="text-[13.5px] mt-1" style={{ color: T.textDim }}>Drag cards between columns, or use the status menu on each card.</p>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto dt-scrollbar pb-4">
        {columns.map((col) => {
          const colIssues = issuesState.filter((i) => i.status === col);
          return (
            <div
              key={col}
              className="w-[280px] shrink-0 rounded-xl transition-colors"
              style={{ background: overCol === col ? "rgba(227,18,63,.05)" : "transparent" }}
              onDragOver={(e: any) => { e.preventDefault(); setOverCol(col); }}
              onDragLeave={() => setOverCol((c: any) => (c === col ? null : c))}
              onDrop={(e: any) => { e.preventDefault(); if (dragKey) moveIssue(dragKey, col); setOverCol(null); setDragKey(null); }}
            >
              <div className="flex items-center gap-2 px-1 mb-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_STYLE[col].dot }} />
                <span className="text-[12px] font-mono uppercase tracking-wider" style={{ color: T.textDim }}>{col}</span>
                <span className="ml-auto text-[11px] font-mono px-1.5 py-0.5 rounded" style={{ background: T.surface2, color: T.textFaint }}>{colIssues.length}</span>
              </div>
              <div className={`space-y-2.5 min-h-[80px] rounded-lg p-1 ${overCol === col ? "dt-drag-over" : ""}`} style={{ border: "1px dashed transparent" }}>
                {colIssues.map((i) => (
                  <div
                    key={i.key}
                    draggable
                    onDragStart={() => setDragKey(i.key)}
                    onDragEnd={() => setDragKey(null)}
                    onClick={() => goIssue(i.key)}
                    data-interactive
                    className="dt-card dt-card-hover p-3.5 cursor-pointer"
                    style={{ opacity: dragKey === i.key ? 0.4 : 1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10.5px]" style={{ color: T.textFaint }}>{i.key}</span>
                      <PriorityBadge p={i.priority} />
                    </div>
                    <div className="text-[13px] leading-snug mb-3">{i.title}</div>
                    <div className="flex items-center justify-between">
                      <SeverityBadge s={i.severity} />
                      <Avatar user={byId(i.assignee)} size={20} />
                    </div>
                    {i.labels.length > 0 && <div className="mt-2.5"><Labels items={i.labels.slice(0, 2)} /></div>}
                    <select
                      value={i.status}
                      onClick={(e: any) => e.stopPropagation()}
                      onChange={(e: any) => moveIssue(i.key, e.target.value)}
                      className="dt-input dt-focusable w-full rounded-md px-2 py-1 text-[11px] mt-3"
                      data-interactive
                    >
                      {columns.map((c: any) => <option key={c} value={c}>Move to {c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   PROJECTS
   ============================================================================ */
function ProjectCard({ p, onOpen }: any) {
  return (
    <button onClick={() => onOpen(p.id)} data-interactive className="dt-card dt-card-hover dt-focusable p-5 text-left w-full">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: T.surface3 }}>
          <FolderKanban size={17} color={T.crimsonBright} />
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-[20px]" style={{ color: p.health >= 80 ? T.green : p.health >= 60 ? T.amber : T.crimsonBright }}>{p.health}%</div>
          <div className="text-[10px]" style={{ color: T.textFaint }}>health</div>
        </div>
      </div>
      <div className="text-[15px] font-semibold mb-1">{p.name}</div>
      <p className="text-[12.5px] mb-4 leading-relaxed" style={{ color: T.textDim }}>{p.desc}</p>
      <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: T.surface3 }}>
        <div className="h-full rounded-full" style={{ width: `${p.health}%`, background: p.health >= 80 ? T.green : p.health >= 60 ? T.amber : T.crimson }} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[12px]" style={{ color: T.textDim }}>
          <span>{p.open} open</span>
          <span style={{ color: T.crimsonBright }}>{p.critical} critical</span>
        </div>
        <div className="flex -space-x-1.5">
          {p.team.map((uid: any) => <Avatar key={uid} user={byId(uid)} size={22} />)}
        </div>
      </div>
    </button>
  );
}

function Projects({ onOpen }: any) {
  const myRole = (byId(meId) as any)?.role?.toLowerCase() || "";
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin";
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", key: "", desc: "", lead: "", status: "Active", repoUrl: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (PROJECTS.some(p => p.key === form.key)) {
      setError("Project key must be unique.");
      setLoading(false); isSubmitting.current = false;
      return;
    }

    try {
      const res = await createProject(form.name, form.key, form.desc);
      if (res.error) {
        setError(res.error);
      } else {
        PROJECTS.unshift({
          ...res.data,
          health: 100, open: 0, critical: 0, team: [meId], velocity: 0, resTime: 0, backlog: 0, aging: 0, workload: 0
        }); 
        setRefresh((r: number) => r + 1); // trigger re-render
        setShowModal(false);
        setForm({ name: "", key: "", desc: "", lead: "", status: "Active", repoUrl: "" });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); isSubmitting.current = false;
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-[1300px] w-full mx-auto dt-fade flex flex-col flex-1 min-h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="font-display font-bold text-[24px]">Projects</h1>
          <p className="text-[13.5px] mt-1" style={{ color: T.textDim }}>All engineering projects and their current health.</p>
        </div>
        {isOwner && (
          <Button variant="primary" onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-[13px]">
            <Plus size={15} /> Create Project
          </Button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 flex-1 content-start">
        {PROJECTS.length > 0 ? PROJECTS.map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpen} />) : (
          <div className="col-span-full py-12 text-center text-[13px]" style={{ color: T.textDim }}>
            No projects yet.
            {isOwner && <div className="mt-3"><Button variant="primary" onClick={() => setShowModal(true)}>Create Project</Button></div>}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dt-fade" onClick={() => setShowModal(false)}>
          <div className="dt-card w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
            <h2 className="font-display font-bold text-[20px] mb-5">Create Project</h2>
            {error && <div className="mb-4 text-red-400 text-[13px]">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Project name"><TextField value={form.name} onChange={(e: any) => setForm({...form, name: e.target.value})} required placeholder="E-Commerce Platform" /></Field>
              <Field label="Project key"><TextField value={form.key} onChange={(e: any) => setForm({...form, key: e.target.value})} required placeholder="ECOM" /></Field>
              <Field label="Description"><textarea rows={3} value={form.desc} onChange={(e: any) => setForm({...form, desc: e.target.value})} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13px]" data-interactive /></Field>
              <Field label="Project lead">
                <select value={form.lead} onChange={(e: any) => setForm({...form, lead: e.target.value})} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13px]" data-interactive>
                  <option value="">Select member</option>
                  {USERS.filter(u => {
                    const r = u?.role?.toLowerCase() || "";
                    if (r === "owner") return false;
                    const myRole = (byId(meId) as any)?.role?.toLowerCase() || "";
                    if (r === "admin" && myRole !== "owner") return false;
                    return true;
                  }).map((u: any) => <option key={u?.id} value={u?.id}>{u?.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status">
                  <select value={form.status} onChange={(e: any) => setForm({...form, status: e.target.value})} className="dt-input dt-focusable w-full rounded-lg px-3.5 py-2.5 text-[13px]" data-interactive>
                    <option>Active</option>
                    <option>Planning</option>
                    <option>Archived</option>
                  </select>
                </Field>
                <Field label="Repository URL"><TextField value={form.repoUrl} onChange={(e: any) => setForm({...form, repoUrl: e.target.value})} placeholder="https://github.com/..." /></Field>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[13px]">Cancel</Button>
                <Button type="submit" variant="primary" className="px-4 py-2 text-[13px]" disabled={loading}>
                  {loading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ projectId, goProjects, goIssue, goIssuesFiltered, goBoard }: any) {
  const p = PROJECTS.find((x) => x.id === projectId) || PROJECTS[0];
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Issues", "Board", "Components", "Versions", "Milestones"];
  const projectIssues = ISSUES.filter((i) => i.project === p.id);
  const breakdown = [
    { label: "Issue velocity", value: p.velocity }, { label: "Resolution time", value: p.resTime },
    { label: "Critical backlog", value: p.backlog }, { label: "Aging issues", value: p.aging }, { label: "Team workload", value: p.workload },
  ];

  return (
    <div className="p-5 md:p-8 max-w-[1300px] mx-auto dt-fade">
      <button onClick={goProjects} className="dt-focusable flex items-center gap-1.5 text-[12.5px] mb-4" style={{ color: T.textFaint }} data-interactive>
        <ArrowLeft size={14} /> Back to Projects
      </button>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[24px]">{p.name}</h1>
          <p className="text-[13.5px] mt-1 max-w-lg" style={{ color: T.textDim }}>{p.desc}</p>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-[32px]" style={{ color: p.health >= 80 ? T.green : p.health >= 60 ? T.amber : T.crimsonBright }}>{p.health}<span className="text-[16px]" style={{ color: T.textFaint }}>/100</span></div>
          <div className="text-[11px]" style={{ color: T.textFaint }}>engineering health</div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto dt-scrollbar" style={{ borderBottom: `1px solid ${T.border}` }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-interactive
            className="dt-focusable px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap relative"
            style={{ color: tab === t ? T.text : T.textFaint }}
          >
            {t}
            {tab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: T.crimson, boxShadow: `0 0 8px ${T.crimson}` }} />}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 dt-card p-5">
            <SectionLabel>Health Breakdown</SectionLabel>
            <div className="space-y-4">
              {breakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1.5"><span>{b.label}</span><span className="font-mono">{b.value}</span></div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.surface3 }}>
                    <div className="h-full rounded-full" style={{ width: `${b.value}%`, background: b.value >= 80 ? T.green : b.value >= 60 ? T.amber : T.crimson }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="dt-card p-5">
            <SectionLabel>Team</SectionLabel>
            <div className="space-y-3">
              {p.team.map((uid: any) => {
                const u = byId(uid);
                return (
                  <div key={uid} className="flex items-center gap-3">
                    <Avatar user={u} size={30} />
                    <div><div className="text-[12.5px] font-medium">{u?.name}</div><div className="text-[11px]" style={{ color: T.textFaint }}>{u?.role}</div></div>
                  </div>
                );
              })}
            </div>
            <SectionLabel className="mt-5">Stats</SectionLabel>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-lg p-3" style={{ background: T.surface2 }}><div className="text-[10px]" style={{ color: T.textFaint }}>OPEN</div><div className="font-display font-bold text-[18px]">{p.open}</div></div>
              <div className="rounded-lg p-3" style={{ background: T.surface2 }}><div className="text-[10px]" style={{ color: T.textFaint }}>CRITICAL</div><div className="font-display font-bold text-[18px]" style={{ color: T.crimsonBright }}>{p.critical}</div></div>
            </div>
          </div>
        </div>
      )}
      {tab === "Issues" && (
        <div className="dt-card overflow-hidden">
          {projectIssues.map((i) => (
            <button key={i.key} onClick={() => goIssue(i.key)} data-interactive className="dt-row dt-focusable w-full text-left flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <span className="font-mono text-[11.5px] w-16" style={{ color: T.textFaint }}>{i.key}</span>
              <span className="text-[13px] truncate flex-1">{i.title}</span>
              <PriorityBadge p={i.priority} /><StatusBadge s={i.status} />
            </button>
          ))}
        </div>
      )}
      {tab === "Board" && (
        <div className="text-center py-16 dt-card">
          <KanbanSquare size={22} color={T.textFaint} className="mx-auto mb-3" />
          <p className="text-[13px] mb-4" style={{ color: T.textDim }}>View this project's issues on the full kanban board.</p>
          <Button variant="primary" onClick={goBoard} className="mx-auto">Open Board</Button>
        </div>
      )}
      {tab === "Components" && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {COMPONENTS.map((c: any) => (
            <div key={c.id || c} className="dt-card p-4 flex items-center justify-between">
              <span className="text-[13px]">{c.name || c}</span>
              <span className="text-[11px] font-mono" style={{ color: T.textFaint }}>{ISSUES.filter((i) => i.component === (c.name || c)).length} issues</span>
            </div>
          ))}
        </div>
      )}
      {tab === "Versions" && (
        <div className="dt-card overflow-hidden">
          {VERSIONS.map((v) => (
            <div key={v} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <span className="font-mono text-[13px]">{v}</span>
              <span className="text-[11.5px]" style={{ color: T.textFaint }}>{ISSUES.filter((i) => i.version === v).length} linked issues</span>
            </div>
          ))}
        </div>
      )}
      {tab === "Milestones" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {MILESTONES.map((m) => (
            <div key={m} className="dt-card p-4">
              <div className="text-[13px] font-medium mb-1">{m}</div>
              <div className="text-[11.5px]" style={{ color: T.textFaint }}>{ISSUES.filter((i) => i.milestone === m).length} issues</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ANALYTICS
   ============================================================================ */
function Analytics() {
  const openCount = ISSUES.filter(i => i.status === "OPEN").length;
  const critCount = ISSUES.filter(i => i.severity === "CRITICAL" && i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const createdCount = ISSUES.length;
  const resCount = ISSUES.filter(i => i.status === "RESOLVED" || i.status === "CLOSED").length;
  const resRate = createdCount > 0 ? Math.round((resCount / createdCount) * 100) : 0;

  const agingMap: any = { "< 7d": 0, "7-14d": 0, "15-30d": 0, "> 30d": 0 };
  const now = new Date().getTime();
  ISSUES.forEach(i => {
    if (i.status !== "RESOLVED" && i.status !== "CLOSED") {
      const d = (now - new Date(i.created_at || now).getTime()) / (1000 * 60 * 60 * 24);
      if (d < 7) agingMap["< 7d"]++;
      else if (d <= 14) agingMap["7-14d"]++;
      else if (d <= 30) agingMap["15-30d"]++;
      else agingMap["> 30d"]++;
    }
  });
  const agingData = Object.keys(agingMap).map(k => ({ bucket: k, count: agingMap[k] }));

  const wlMap: any = {};
  ISSUES.forEach(i => {
    if (i.status !== "RESOLVED" && i.status !== "CLOSED" && i.assignee) {
      wlMap[i.assignee] = (wlMap[i.assignee] || 0) + 1;
    }
  });
  const workloadData = Object.keys(wlMap).map(k => {
    const u = USERS.find(u => u.id === k);
    return { name: u ? u.name.split(" ")[0] : "Unknown", count: wlMap[k] };
  }).sort((a,b) => b.count - a.count).slice(0, 10);

  const resTimeTrend: any[] = [];

  const severityDist = [
    { name: "Critical", value: ISSUES.filter(i => i.severity === "CRITICAL").length, color: T.crimson },
    { name: "High", value: ISSUES.filter(i => i.severity === "HIGH").length, color: T.amber },
    { name: "Medium", value: ISSUES.filter(i => i.severity === "MEDIUM").length, color: T.blue },
    { name: "Low", value: ISSUES.filter(i => i.severity === "LOW").length, color: T.textDim },
  ].filter(d => d.value > 0);

  const createdVsResolved = ISSUES.length ? [{ d: "All", created: createdCount, resolved: resCount }] : [];
  
  const componentDistMap: any = {};
  ISSUES.forEach(i => {
    if (i.component) {
      componentDistMap[i.component] = (componentDistMap[i.component] || 0) + 1;
    }
  });
  const componentDist = Object.keys(componentDistMap).map(k => ({ name: k, value: componentDistMap[k] })).sort((a,b) => b.value - a.value).slice(0, 6);


  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto dt-fade">
      <h1 className="font-display font-bold text-[24px] mb-1">Analytics</h1>
      <p className="text-[13.5px] mb-6" style={{ color: T.textDim }}>Engineering health across your entire organization.</p>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Open Issues" value={openCount.toString()} icon={CircleDot} />
        <MetricCard label="Critical" value={critCount.toString()} icon={AlertTriangle} accent />
        <MetricCard label="Created" value={createdCount.toString()} icon={Plus} />
        <MetricCard label="Resolved" value={resCount.toString()} icon={CheckCircle2} />
        <MetricCard label="MTTR" value="N/A" icon={Clock} />
        <MetricCard label="Resolution Rate" value={`${resRate}%`} icon={TrendingUp} />
        
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Issues Created vs Resolved" subtitle="7-day trend across all projects">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={createdVsResolved.length ? createdVsResolved : []}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="d" tick={{ fill: T.textFaint, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="created" stroke={T.crimsonBright} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="resolved" stroke={T.green} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Issues by Component" subtitle="Distribution across the codebase">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={componentDist.length ? componentDist : []} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: T.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: T.textDim, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" fill={T.crimson} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <ChartCard title="Issues by Severity">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={severityDist.length ? severityDist : []} dataKey="value" nameKey="name" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {severityDist.map((d, idx) => <Cell key={idx} fill={d.color} />)}
              </Pie>
              <RTooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Issue Aging" subtitle="Days open">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={agingData.length ? agingData : []}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={20} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill={T.amber} radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Resolution Time" subtitle="Avg hours to resolve, by week">
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={resTimeTrend.length ? resTimeTrend : []}>
              <defs>
                <linearGradient id="gradRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.blue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={T.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="w" tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={{ fill: T.textFaint, fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <RTooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="hrs" stroke={T.blue} fill="url(#gradRes)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Team Workload" subtitle="Open issues assigned per engineer">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={workloadData.length ? workloadData : []}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: T.textDim, fontSize: 11 }} axisLine={{ stroke: T.border }} tickLine={false} />
            <YAxis tick={{ fill: T.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} width={22} />
            <RTooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="count" fill={T.crimsonDim} radius={[4, 4, 0, 0]} barSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ============================================================================
   TEAM
   ============================================================================ */
function Team() {
  return (
    <div className="p-5 md:p-8 max-w-[1100px] mx-auto dt-fade">
      <h1 className="font-display font-bold text-[24px] mb-1">Team</h1>
      <p className="text-[13.5px] mb-6" style={{ color: T.textDim }}>Roles, workload and current status.</p>
      <div className="dt-card overflow-hidden">
        {USERS.map((u) => {
          const assigned = ISSUES.filter((i) => i.assignee === u?.id);
          const open = assigned.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length;
          return (
            <div key={u?.id} className="flex flex-wrap items-center gap-4 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <Avatar user={u} size={40} />
              <div className="min-w-[140px]">
                <div className="text-[13.5px] font-medium">{u?.name}</div>
                <div className="text-[11.5px]" style={{ color: T.textFaint }}>{u?.email}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: T.surface3, color: T.textDim, border: `1px solid ${T.border}` }}>{u?.role}</span>
              <div className="ml-auto flex items-center gap-6 text-[12.5px]" style={{ color: T.textDim }}>
                <span>{assigned.length} assigned</span>
                <span>{open} open</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: u?.status === "online" ? T.green : u?.status === "away" ? T.amber : T.textFaint }} />
                  {u?.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   ORG VERIFICATION
   ============================================================================ */
function Verification() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/data/profiles").then(m => {
      m.getPendingVerifications().then(data => {
        setRequests(data);
        setLoading(false); isSubmitting.current = false;
      });
    });
  }, []);

  const act = async (id: string, status: string) => {
    const { approveVerification, rejectVerification } = await import("@/lib/data/profiles");
    if (status === "ACTIVE") await approveVerification(id);
    else await rejectVerification(id);
    
    setRequests((rs) => rs.map((r) => (r.user_id === id ? { ...r, status } : r)));
  };

  return (
    <div className="p-5 md:p-8 max-w-[1000px] mx-auto dt-fade">
      <div className="mb-6">
        <h1 className="font-display font-bold text-[24px] mb-1">Identity Verification</h1>
        <p className="text-[13.5px]" style={{ color: T.textDim }}>Approve or reject employees requesting access to your workspace.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <div className="text-[13px] p-4" style={{ color: T.textDim }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="col-span-2 text-center p-12 dt-card">
            <ShieldCheck size={32} color={T.textFaint} className="mx-auto mb-3" />
            <div className="font-medium mb-1">No pending verification requests.</div>
            <div className="text-[13px]" style={{ color: T.textDim }}>All organization members have been verified.</div>
          </div>
        ) : (
          requests.map((r: any) => (
            <div key={r.user_id} className="dt-card p-5 relative overflow-hidden group">
              {r.status !== "pending" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm dt-fade">
                  <div className="text-white font-medium flex items-center gap-2">
                    {r.status === "active" ? <><CheckCircle2 size={18} className="text-green-400" /> Approved</> : <><XCircle size={18} className="text-red-400" /> Rejected</>}
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px]" style={{ background: T.surface2, color: T.text }}>
                    {r.profiles?.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-[14.5px]">{r.profiles?.full_name}</div>
                    <div className="text-[12.5px]" style={{ color: T.textDim }}>{r.profiles?.email} &middot; {r.role}</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: T.surface3, color: T.textDim }}>
                  {r.employee_id}
                </div>
              </div>
              <div className="mb-4">
                <Button className="text-[12px] py-1.5 px-3" onClick={async () => {
                  const sb = createClient();
                  const { data } = await sb.storage.from("verification_documents").list(r.user_id);
                  if (data && data.length > 0) {
                    const doc = data[data.length - 1];
                    const { data: urlData } = await sb.storage.from("verification_documents").createSignedUrl(r.user_id + "/" + doc.name, 60);
                    if (urlData) window.open(urlData.signedUrl, "_blank");
                    else alert("Could not open document.");
                  } else {
                    alert("No document uploaded.");
                  }
                }}>
                  <IdCard size={14} className="mr-2" /> View ID Document
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" className="flex-1 py-2 text-[12.5px] bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20" onClick={() => act(r.user_id, "active")}>Approve</Button>
                <Button className="flex-1 py-2 text-[12.5px] bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" onClick={() => act(r.user_id, "rejected")}>Reject</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SETTINGS
   ============================================================================ */
function Settings() {
  const [tab, setTab] = useState("Profile");
  const [profileName, setProfileName] = useState((byId(meId) as any)?.name || "Apoorv Malhotra");
  const actualMe = byId(meId) as any;
  const [globalSrc, setGlobalSrc] = useState(actualMe?.avatarUrl || actualMe?.avatar_url);
  const [orgName, setOrgName] = useState(actualMe?.orgName || "");
  const [orgDesc, setOrgDesc] = useState(actualMe?.orgDesc || "");

  const handleAvatarChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image file under 5MB.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    const meUser = byId(meId) as any;
    if (meUser) meUser.avatarUrl = localUrl;
    setGlobalSrc(localUrl);
    
    const res = await uploadAvatarToSupabase(file);
    if (res.error) {
      alert(res.error);
    } else if (res.url) {
      if (meUser) meUser.avatarUrl = res.url;
      setGlobalSrc(res.url);
    }
    
    e.target.value = null;
  };

  const handleRemoveAvatar = () => {
    const meUser = byId(meId) as any;
    if (meUser) meUser.avatarUrl = null;
    setGlobalSrc(null);
  };

  const tabs = [
    { id: "Profile", icon: User }, { id: "Organization", icon: Building2 }, { id: "Team", icon: Users },
  ];
  return (
    <div className="p-5 md:p-8 max-w-[1100px] mx-auto dt-fade flex-1">
      <h1 className="font-display font-bold text-[24px] mb-6">Settings</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex md:flex-col gap-1 overflow-x-auto dt-scrollbar shrink-0 md:w-[200px]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-interactive
              className="dt-nav-item dt-focusable flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap"
              style={{ color: tab === t.id ? T.text : T.textDim, background: tab === t.id ? T.surface2 : "transparent" }}
            >
              <t.icon size={15} /> {t.id}
            </button>
          ))}
        </div>
        <div className="dt-card p-5 sm:p-6 flex-1 min-w-0">
          {tab === "Profile" && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Avatar user={{ ...((byId(meId) as any) || {}), name: profileName }} size={56} />
                <div className="flex gap-2">
                  <label className="dt-focusable cursor-pointer">
                    <Button className="text-[12px] py-1.5 pointer-events-none">Change avatar</Button>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                  {globalSrc && (
                    <Button className="text-[12px] py-1.5 text-red-500" onClick={handleRemoveAvatar}>Remove</Button>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <TextField 
                    value={profileName} 
                    onChange={(e: any) => setProfileName(e.target.value)} 
                  />
                </Field>
                <Field label="Email"><TextField value={(byId(meId) as any)?.email || ""} disabled /></Field>
                <Field label="Role"><TextField value={(byId(meId) as any)?.role || ""} disabled /></Field>
                <Field label="Employee ID"><TextField value={(byId(meId) as any)?.empId || ""} disabled /></Field>
              </div>
              <Button variant="primary" className="mt-2" onClick={async () => {
                const { updateProfileName } = await import("@/lib/data/profiles");
                const res = await updateProfileName(profileName);
                if (res.error) alert(res.error); else alert("Profile updated!");
              }}>Save Changes</Button>
            </>
          )}
          {tab === "Organization" && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Organization Name"><TextField value={orgName} onChange={(e:any) => setOrgName(e.target.value)} disabled={actualMe?.role?.toLowerCase() !== "owner"} /></Field>
              </div>
              
              {actualMe?.role?.toLowerCase() === "owner" && (
                <Button variant="primary" onClick={async () => {
                  const { updateOrganization } = await import("@/lib/data/profiles");
                  const res = await updateOrganization(actualMe?.orgId, orgName, "");
                  if (res.error) alert(res.error); else alert("Organization updated!");
                }}>Save Changes</Button>
              )}
            </>
          )}
          {tab === "Team" && <Team />}
          
          
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ROOT APP
   ============================================================================ */
const ROUTE_TITLES = { dashboard: "Overview", issues: "Issues", board: "Board", projects: "Projects", analytics: "Analytics", team: "Team", settings: "Settings", verification: "Verification" };


/* ============================================================================
   CUSTOM CURSOR
   ============================================================================ */
function CustomCursor({ enabled }: any) {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!enabled) return;
    let raf: number;
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const down = () => {
      if (dotRef.current) dotRef.current.style.transform += " scale(.55)";
      if (ringRef.current) ringRef.current.style.transform = ringRef.current.style.transform.replace(/scale\([^)]*\)/, "") + " scale(.8)";
    };
    const up = () => {};
    const over = (e: MouseEvent) => {
      const el = (e.target as Element).closest && (e.target as Element).closest('a, button, input, textarea, select, [role="button"], [data-interactive]');
      if (ringRef.current) ringRef.current.dataset.hover = el ? "1" : "0";
    };
    const loop = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.22;
      ring.current.y += (pos.current.y - ring.current.y) * 0.22;
      if (dotRef.current) dotRef.current.style.transform = `translate(${pos.current.x - 3}px, ${pos.current.y - 3}px)`;
      if (ringRef.current) {
        const hover = ringRef.current.dataset.hover === "1";
        const size = hover ? 44 : 28;
        ringRef.current.style.width = size + "px";
        ringRef.current.style.height = size + "px";
        ringRef.current.style.transform = `translate(${ring.current.x - size / 2}px, ${ring.current.y - size / 2}px)`;
        ringRef.current.style.opacity = hover ? "1" : "0.55";
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mouseover", over);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border" style={{ borderColor: T.crimson, transition: "width .15s, height .15s, opacity .15s" }} />
      <div ref={dotRef} className="fixed top-0 left-0 w-[6px] h-[6px] pointer-events-none z-[10000] rounded-full" style={{ background: T.crimsonBright }} />
    </>
  );
}


const STATUS_STYLE: any = {
  "OPEN": { dot: T.blue, text: T.text, bg: T.surface2 },
  "IN PROGRESS": { dot: T.amber, text: T.amber, bg: `${T.amber}11` },
  "IN REVIEW": { dot: T.purple, text: T.purple, bg: `${T.purple}11` },
  "RESOLVED": { dot: T.green, text: T.green, bg: `${T.green}11` },
  "CLOSED": { dot: T.textDim, text: T.textDim, bg: T.surface2 },
};

function StatusBadge({ s }: { s: string }) {
  const st = STATUS_STYLE[s] || STATUS_STYLE["OPEN"];
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wide uppercase" style={{ background: st.bg, color: st.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} /> {s}
    </div>
  );
}

function PriorityBadge({ p }: { p: string }) {
  let c = T.textDim;
  if (p === "HIGH") c = T.amber;
  if (p === "CRITICAL") c = T.crimson;
  return (
    <div className="inline-flex items-center gap-1 text-[11px] font-mono tracking-wide uppercase" style={{ color: c }}>
      <ArrowUpCircle size={12} /> {p}
    </div>
  );
}

function SeverityBadge({ s }: { s: string }) {
  let c = T.textDim;
  if (s === "HIGH") c = T.amber;
  if (s === "CRITICAL") c = T.crimsonBright;
  return (
    <div className="inline-flex items-center gap-1 text-[11px] font-mono tracking-wide uppercase" style={{ color: c }}>
      <AlertTriangle size={12} /> {s}
    </div>
  );
}


async function uploadAvatarToSupabase(file: File) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in" };
  const ext = file.name.split('.').pop();
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file);
  if (error) return { error: error.message };
  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
  await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
  return { url: publicUrl };
}

function VerificationPendingBlocker({ user }: { user: any }) {
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const path = `${user.id}/id-document-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("verification_documents").upload(path, file);
      if (uploadErr) {
        setError("Document upload failed: " + uploadErr.message);
      } else {
        setSuccess(true);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black dt-fade devtrack-root">
      <div className="dt-card p-8 max-w-md w-full text-center">
        <Clock size={32} className="mx-auto mb-4" style={{ color: T.amber }} />
        <h1 className="font-display font-bold text-[20px] mb-2">Verification Pending</h1>
        <p className="text-[13px] mb-6 leading-relaxed" style={{ color: T.textDim }}>
          Your organization administrator must verify your identity before you can access the workspace.
        </p>
        
        {!success ? (
          <div className="text-left bg-black/20 p-4 rounded-lg border border-white/5 mb-6">
            <div className="text-[12px] font-medium mb-3">Missing ID Document?</div>
            <p className="text-[11.5px] mb-3" style={{ color: T.textFaint }}>If you didn't upload your ID during registration, upload it now to expedite verification.</p>
            <input type="file" accept="image/*" className="dt-input w-full text-[12px] p-2 mb-3" onChange={(e: any) => setFile(e.target.files?.[0])} />
            <Button variant="primary" className="w-full text-[12px] py-1.5" disabled={!file || uploading} onClick={handleUpload}>
              {uploading ? "Uploading..." : "Submit ID Document"}
            </Button>
            {error && <div className="mt-3 text-red-500 text-[11.5px]">{error}</div>}
          </div>
        ) : (
          <div className="text-green-500 text-[12px] p-3 bg-green-500/10 rounded mb-6 border border-green-500/20">
            Document successfully uploaded!
          </div>
        )}

        <Button onClick={async () => {
          const { logout } = await import("@/lib/data/auth");
          await logout();
          window.location.reload();
        }}>Sign Out</Button>
      </div>
    </div>
  );
}

export default function DevTrackApp() {
  const [screen, setScreen] = useState("landing"); // landing | login | register | app
  const [view, setView] = useState("dashboard");
  const [activeIssue, setActiveIssue] = useState("BUG-201");
  const [activeProject, setActiveProject] = useState("p1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [authError, setAuthError] = useState("");
  const [refresh, setRefresh] = useState(0); // to force re-render when global data changes

  useEffect(() => {
    async function loadUser() {
      try {
        const { user, profile, orgMember } = await getCurrentUserProfile();
        if (user) {
          meId = profile?.id || user.id;
          const existing = USERS.findIndex(u => u.id === (profile?.id || user.id));
          const mappedUser = {
            id: profile?.id || user.id,
            name: orgMember?.full_name || profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email?.split("@")[0] || "Unknown",
            initials: (orgMember?.full_name || profile?.full_name || profile?.username || user.user_metadata?.full_name || user.email || "U").substring(0, 2).toUpperCase(),
            role: orgMember?.role || "member",
            email: user.email,
            color: T.blue,
            status: "online",
            orgId: orgMember?.organization_id,
            orgName: (orgMember?.organizations as any)?.name || "",
            orgDesc: (orgMember?.organizations as any)?.description || "",
            orgStatus: orgMember?.status,
            empId: orgMember?.employee_id,
            avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url
          };
          if (existing !== -1) {
            USERS[existing] = { ...USERS[existing], ...mappedUser };
          } else {
            USERS.push(mappedUser as any);
          }

          
          const team = await getTeamMembers();
          if (team && team.length > 0) {
            team.forEach((t: any) => {
              if (t.user_id === mappedUser.id) return; // already pushed me
              const tProfile = t.profiles || {};
              const tMap = {
                id: t.user_id,
                name: t.full_name || tProfile.username || t.email?.split('@')[0] || "Unknown",
                initials: (t.full_name || tProfile.username || t.email || "U").substring(0, 2).toUpperCase(),
                role: t.role || "member",
                email: t.email,
                color: T.green,
                status: t.status === "active" ? "online" : "away",
                orgId: t.organization_id,
                orgStatus: t.status,
                empId: t.employee_id,
                avatarUrl: tProfile.avatar_url
              };
              const ex = USERS.findIndex(u => u.id === t.user_id);
              if (ex !== -1) USERS[ex] = { ...USERS[ex], ...tMap };
              else USERS.push(tMap as any);
            });
          }
          
          const dbProjects = await getProjects();
          if (dbProjects && dbProjects.length > 0) {
            PROJECTS = dbProjects.map((p: any) => ({
              id: p.id,
              name: p.name,
              key: p.key,
              desc: p.description,
              health: 100, open: 0, critical: 0, team: [meId], velocity: 0, resTime: 0, backlog: 0, aging: 0, workload: 0
            }));
          }

          const dbActivities = await getActivities();
          if (dbActivities && dbActivities.length > 0) {
            ACTIVITIES = dbActivities.map((a: any) => ({
              id: a.id,
              user: a.actor?.id || meId,
              action: (a.action || "").toUpperCase(),
              target: a.issue?.title || "Unknown Issue",
              time: a.created_at ? new Date(a.created_at).toLocaleDateString() : "just now",
              icon: ActivityIcon, color: T.text
            }));
          }

          const dbIssues = await getIssueData();
          if (dbIssues.issues && dbIssues.issues.length > 0) {
            ISSUES = dbIssues.issues.map((i: any) => ({
              id: i.id,
              key: i.project?.key + "-" + i.id.substring(0,4),
              title: i.title,
              description: i.description,
              priority: i.priority,
              severity: i.severity,
              status: i.status,
              project: i.project_id,
              component: i.component?.name || "Frontend",
              assignee: i.assignee?.id || null,
              reporter: i.reporter?.id || meId,
              labels: i.issue_labels ? i.issue_labels.map((il: any) => il.label?.name).filter(Boolean) : [],
              version: i.version?.name || "",
              milestone: i.milestone?.name || "",
              updated: i.updated_at ? new Date(i.updated_at).toLocaleDateString() : "just now",
              created: i.created_at ? new Date(i.created_at).toLocaleDateString() : "just now",
              comments: [], history: [], relations: [],
              aiRootCause: i.ai_analyses?.[0]?.summary || null,
              aiSuggestedComponent: i.ai_analyses?.[0]?.suggested_component_id || null,
              aiSuggestedPriority: i.ai_analyses?.[0]?.suggested_priority || null,
              aiSuggestedSeverity: i.ai_analyses?.[0]?.suggested_severity || null,
              aiConfidence: i.ai_analyses?.[0]?.confidence ? Math.round(i.ai_analyses[0].confidence * 100) : null,
              aiModel: i.ai_analyses?.[0]?.model || null
            }));
          }
          setRefresh((r: number) => r + 1);
          if (screen === "login" || screen === "register") {
            setScreen("app");
            setView("dashboard");
          }
        } else {
          // If no user/profile and we are on app screen, redirect to login
          if (screen === "app") setScreen("login");
        }
      } catch (err: any) {
        setAuthError(err.message || "Failed to load application data.");
      } finally {
        setAuthLoaded(true);
      }
    }
    loadUser();
  }, [screen]);

  useEffect(() => {
    const isCoarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    setCursorEnabled(!isCoarse);
  }, []);

  useEffect(() => {
    const onKey = (e: any) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goApp = () => { setScreen("app"); setView("dashboard"); };
  const goIssue = useCallback((key: string) => { setActiveIssue(key); setView("issue-detail"); }, []);
  const goProject = useCallback((id: string) => { setActiveProject(id); setView("project-detail"); }, []);

  let body = null;
  if (view === "dashboard") body = <Dashboard goIssue={goIssue} setView={setView} />;
  else if (view === "issues") body = <IssuesList goIssue={goIssue} goCreate={() => setView("create-issue")} />;
  else if (view === "my-issues") body = <IssuesList goIssue={goIssue} presetFilter="reported" title="My Issues" subtitle="Issues you've reported." hideCreate={true} />;
  else if (view === "assigned") body = <IssuesList goIssue={goIssue} presetFilter="assigned" title="Assigned to Me" subtitle="Issues currently assigned to you." hideCreate={true} />;
  else if (view === "recent") body = <IssuesList goIssue={goIssue} presetFilter="recent" title="Recently Viewed" subtitle="Issues you've recently opened." hideCreate={true} />;
  else if (view === "issue-detail") body = <IssueDetail issueKey={activeIssue} goIssues={() => setView("issues")} goIssue={goIssue} />;
  else if (view === "create-issue") body = <CreateIssue onCreated={(k: string) => { setRefresh((r: number) => r + 1); goIssue(k); }} goIssue={goIssue} goIssues={() => setView("issues")} />;
  else if (view === "board") body = <Board goIssue={goIssue} />;
  else if (view === "projects") body = <Projects onOpen={goProject} />;
  else if (view === "project-detail") body = <ProjectDetail projectId={activeProject} goProjects={() => setView("projects")} goIssue={goIssue} goBoard={() => setView("board")} />;
  else if (view === "analytics") body = <Analytics />;
  else if (view === "team") body = <Team />;
  else if (view === "verification") body = <Verification />;
  else if (view === "settings") body = <Settings />;

  if (screen === "landing") {
    return (
      <div className="devtrack-root">
        <GlobalStyle />
        <CustomCursor enabled={cursorEnabled} />
        <LandingPage goApp={() => setScreen("register")} goLogin={() => setScreen("login")} />
      </div>
    );
  }
  if (screen === "login") {
    return (
      <div className="devtrack-root">
        <GlobalStyle />
        <CustomCursor enabled={cursorEnabled} />
        <LoginPage goRegister={() => setScreen("register")} goApp={goApp} goLanding={() => setScreen("landing")} />
      </div>
    );
  }
  if (screen === "register") {
    return (
      <div className="devtrack-root">
        <GlobalStyle />
        <CustomCursor enabled={cursorEnabled} />
        <RegisterPage goLogin={() => setScreen("login")} goLanding={() => setScreen("landing")} />
      </div>
    );
  }

  if (screen === "app" && authError) {
    return (
      <div className="devtrack-root bg-black min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={32} className="text-red-500 mb-4" />
        <div className="text-red-500 font-medium mb-2">Application Error</div>
        <div className="text-[13px] text-gray-400 max-w-md">{authError}</div>
        <Button className="mt-6" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  if (screen === "app" && !authLoaded) {
    return (
      <div className="devtrack-root bg-black min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin" size={24} color={T.textDim} />
      </div>
    );
  }
  if (screen === "app" && (byId(meId) as any)?.orgStatus === "pending") {
    return <VerificationPendingBlocker user={byId(meId) as any} />;
  }

  return (
    <div className="devtrack-root" style={{ height: "100vh", minHeight: 560, overflow: "hidden" }}>
      <GlobalStyle />
      <CustomCursor enabled={cursorEnabled} />
      <div className="flex h-full">
        <Sidebar view={view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <Topbar setMobileOpen={setMobileOpen} openSearch={() => setSearchOpen(true)} view={view} setView={setView} />
          <div className="flex-1 overflow-y-auto dt-scrollbar flex flex-col">{body}</div>
        </div>
      </div>
      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigateIssue={goIssue}
        onNavigateProject={goProject}
        setView={setView}
      />
    </div>
  );
}

