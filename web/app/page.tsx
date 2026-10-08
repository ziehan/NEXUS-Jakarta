"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Bell,
  Bot,
  Check,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  TableProperties,
  Users,
} from "lucide-react";

type ReportStatus = "Pending" | "In Progress" | "Verified";
type FilterTab = "All" | ReportStatus;

type Report = {
  id: string;
  title: string;
  category: string;
  location: string;
  submitted: string;
  status: ReportStatus;
  priority: "High" | "Medium" | "Low";
  reporter: string;
};

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Incoming Reports", icon: FileText, count: 12 },
  { label: "AI Action Plans", icon: Bot, count: 4 },
  { label: "Analytics", icon: TableProperties },
  { label: "Settings", icon: Settings },
];

const reports: Report[] = [
  {
    id: "RPT-24081",
    title: "Large pothole on Jalan Kemang Raya",
    category: "Road infrastructure",
    location: "Kemang, Jakarta Selatan",
    submitted: "12 min ago",
    status: "Pending",
    priority: "High",
    reporter: "Dimas P.",
  },
  {
    id: "RPT-24080",
    title: "Street light outage near Taman Menteng",
    category: "Public lighting",
    location: "Menteng, Jakarta Pusat",
    submitted: "35 min ago",
    status: "In Progress",
    priority: "Medium",
    reporter: "Sarah K.",
  },
  {
    id: "RPT-24079",
    title: "Overflowing waste bin at Pasar Senen",
    category: "Waste management",
    location: "Senen, Jakarta Pusat",
    submitted: "1 hr ago",
    status: "Verified",
    priority: "Medium",
    reporter: "Hendra W.",
  },
  {
    id: "RPT-24078",
    title: "Flooded sidewalk after heavy rainfall",
    category: "Drainage",
    location: "Cilandak, Jakarta Selatan",
    submitted: "2 hrs ago",
    status: "Pending",
    priority: "High",
    reporter: "Nadia R.",
  },
  {
    id: "RPT-24077",
    title: "Damaged pedestrian crossing sign",
    category: "Road safety",
    location: "Kebayoran Baru, Jakarta Selatan",
    submitted: "3 hrs ago",
    status: "Verified",
    priority: "Low",
    reporter: "Budi S.",
  },
];

const statusStyles: Record<ReportStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
  Verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const priorityStyles = {
  High: "text-rose-600",
  Medium: "text-amber-600",
  Low: "text-slate-500",
};

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconClass,
  trendDown = false,
}: {
  label: string;
  value: string;
  change: string;
  icon: typeof Activity;
  iconClass: string;
  trendDown?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} strokeWidth={2.2} />
        </div>
        <button
          aria-label={`More options for ${label}`}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-slate-800">
          {value}
        </p>
        <span
          className={`mb-0.5 inline-flex items-center gap-0.5 text-xs font-semibold ${
            trendDown ? "text-rose-500" : "text-emerald-600"
          }`}
        >
          {trendDown ? <ArrowDown size={13} /> : <ArrowUp size={13} />}
          {change}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">vs. last 30 days</p>
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [isApproved, setIsApproved] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesFilter =
        activeFilter === "All" || report.status === activeFilter;
      const matchesSearch =
        !normalizedSearch ||
        `${report.title} ${report.location} ${report.id}`
          .toLowerCase()
          .includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const sidebar = (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center border-b border-slate-100 px-6">
        <p className="text-sm font-bold tracking-[0.14em] text-slate-800">
          NEXUS <span className="text-purple-600">JAKARTA</span>
        </p>
      </div>

      <div className="flex flex-1 flex-col px-3 py-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        <nav className="mt-3 space-y-1">
          {navigation.map(({ label, icon: Icon, count }) => {
            const active = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => {
                  setActiveNav(label);
                  setIsMobileNavOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-purple-50 text-purple-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon
                    size={18}
                    className={active ? "text-purple-600" : "text-slate-400"}
                  />
                  {label}
                </span>
                {count && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-purple-100 text-purple-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-purple-600">
            <ShieldCheck size={17} />
            <span className="text-xs font-bold">All systems operational</span>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-slate-500">
            Data last synced 2 minutes ago
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Jakarta service network
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800">
              Admin 123
            </p>
            <p className="truncate text-[11px] text-slate-400">CRM Officer</p>
          </div>
          <ChevronDown size={15} className="text-slate-400" />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        {sidebar}
      </div>
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative">{sidebar}</div>
        </div>
      )}

      <main className="min-w-0 flex-1 lg:ml-[260px]">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setIsMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Thursday, 08 October 2026
              </p>
              <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                Good morning, CRM Officer <span aria-hidden="true">👋</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <label className="hidden h-10 w-64 items-center gap-2 rounded-xl border border-transparent bg-slate-100 px-3 text-slate-400 focus-within:border-purple-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/10 md:flex">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports..."
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-purple-200 hover:text-purple-600"
            >
              <Bell size={17} />
              <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-purple-600 ring-2 ring-white" />
            </button>
            <div className="hidden size-9 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600 sm:flex">
              AR
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-7 p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
                <Activity size={14} />
                <span>Live operations overview</span>
                <span className="size-1 rounded-full bg-slate-300" />
                <span className="font-medium text-slate-400">
                  Updated 2 min ago
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                Your dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep Jakarta moving forward, one report at a time.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-700">
              <FileText size={16} />
              Create report
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total reports"
              value="1,284"
              change="12.5%"
              icon={FileText}
              iconClass="bg-purple-50 text-purple-600"
            />
            <StatCard
              label="Pending AI approvals"
              value="24"
              change="8.2%"
              icon={Bot}
              iconClass="bg-violet-50 text-violet-600"
            />
            <StatCard
              label="Active field repairs"
              value="86"
              change="4.8%"
              icon={Activity}
              iconClass="bg-blue-50 text-blue-600"
              trendDown
            />
            <StatCard
              label="Resolved tickets"
              value="1,174"
              change="18.7%"
              icon={ClipboardCheck}
              iconClass="bg-emerald-50 text-emerald-600"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <Bot size={17} />
                    </div>
                    <h3 className="font-bold text-slate-800">
                      AI Action Plan Review
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Recommended next action for incoming report
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                  Needs review
                </span>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-purple-600">
                      RPT-24081
                    </p>
                    <h4 className="mt-2 text-lg font-bold leading-6 text-slate-800">
                      Large pothole on Jalan Kemang Raya
                    </h4>
                  </div>
                  <span className="rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                    High priority
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-purple-600"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Kemang, Jakarta Selatan
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Reported by Dimas P. · 12 minutes ago
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Target agency
                    </p>
                    <span className="mt-1.5 inline-flex rounded-md bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600">
                      Dinas Bina Marga
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Est. resolution
                    </p>
                    <p className="mt-1.5 text-xs font-bold text-slate-800">
                      2–3 business days
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      AI confidence score
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      94%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-purple-500 to-violet-700" />
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-slate-400">
                    High confidence based on 18 similar resolved cases in this
                    district.
                  </p>
                </div>
                <button
                  onClick={() => setIsApproved(true)}
                  disabled={isApproved}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isApproved
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700"
                  }`}
                >
                  {isApproved ? <Check size={17} /> : <Bot size={17} />}
                  {isApproved
                    ? "Action plan approved"
                    : "1-Click Approve Action Plan"}
                </button>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30 transition-all hover:shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Recent citizen reports
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Monitor and triage the latest incoming issues
                  </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-purple-300 hover:text-purple-600">
                  <Filter size={14} />
                  Filters
                </button>
              </div>
              <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 pt-4 sm:px-6">
                {(
                  ["All", "Pending", "In Progress", "Verified"] as FilterTab[]
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`whitespace-nowrap border-b-2 px-2 pb-3 text-xs font-semibold transition ${
                      activeFilter === tab
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                    {tab === "All" && (
                      <span className="ml-1.5 text-[10px] text-slate-400">
                        24
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3 font-bold sm:px-6">Report</th>
                      <th className="px-3 py-3 font-bold">Location</th>
                      <th className="px-3 py-3 font-bold">Priority</th>
                      <th className="px-3 py-3 font-bold">Status</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="group transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <p className="max-w-[210px] truncate text-xs font-bold text-slate-800">
                            {report.title}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {report.id} · {report.submitted}
                          </p>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <MapPin
                              size={12}
                              className="shrink-0 text-slate-400"
                            />
                            <span className="max-w-[125px] truncate">
                              {report.location}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-3 py-4 text-[11px] font-bold ${priorityStyles[report.priority]}`}
                        >
                          {report.priority}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${statusStyles[report.status]}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            aria-label={`More options for ${report.id}`}
                            className="rounded-lg p-1.5 text-slate-400 opacity-60 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredReports.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search size={22} className="text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No reports found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try another search or status filter.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
                <p className="text-[11px] text-slate-400">
                  Showing {filteredReports.length} of 24 reports
                </p>
                <button className="text-xs font-bold text-purple-600 hover:text-purple-600">
                  View all reports →
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Avg. response time</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  4h 12m{" "}
                  <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                    ↓ 16%
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Citizen satisfaction</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  92.4%{" "}
                  <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                    ↑ 3.2%
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Escalations this week</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">
                  7{" "}
                  <span className="ml-1 text-[10px] font-semibold text-emerald-600">
                    ↓ 28%
                  </span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
