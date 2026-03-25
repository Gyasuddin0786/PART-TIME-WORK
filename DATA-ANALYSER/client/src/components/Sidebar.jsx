import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Upload & Analyse", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
  { to: "/history",   label: "History",           icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-stone-800 border-r border-stone-700 flex flex-col transition-all duration-300 z-40 ${collapsed ? "w-16" : "w-60"}`}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-stone-700 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 shadow">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        {!collapsed && <span className="text-white font-bold text-base whitespace-nowrap tracking-tight">LeadAnalyser</span>}
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-stone-300 hover:text-white hover:bg-stone-700"
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + controls */}
      <div className="border-t border-stone-700 p-3 space-y-1 shrink-0">
        {!collapsed && (
          <div className="px-2 py-2 mb-1">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-stone-400 text-xs truncate">{user?.email}</p>
          </div>
        )}
        <button onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 text-sm transition">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && "Logout"}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-stone-500 hover:text-white hover:bg-stone-700 text-sm transition">
          <svg className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
