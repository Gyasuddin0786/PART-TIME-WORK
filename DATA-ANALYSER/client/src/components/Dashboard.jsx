import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import { useState } from "react";

// ── Human-designed color palette (warm, professional, not AI-purple) ──────
const C = {
  teal:    "#0d9488",
  tealLt:  "#ccfbf1",
  blue:    "#1d4ed8",
  blueLt:  "#dbeafe",
  amber:   "#b45309",
  amberLt: "#fef3c7",
  rose:    "#be123c",
  roseLt:  "#ffe4e6",
  slate:   "#475569",
  green:   "#15803d",
  greenLt: "#dcfce7",
  orange:  "#c2410c",
};

const PIE_COLORS = ["#0d9488", "#1d4ed8", "#b45309", "#be123c", "#15803d", "#7c3aed"];

// ── Reusable table matching image layout ──────────────────────────────────
function DataTable({ title, headers, rows, highlight = [] }) {
  return (
    <div className="rounded-xl border border-stone-200 overflow-hidden shadow-sm">
      {title && (
        <div className="bg-stone-700 px-4 py-2.5">
          <span className="text-white font-semibold text-sm tracking-wide">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-100 border-b border-stone-200">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-stone-600 whitespace-nowrap text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isTotal = String(row[0]).toLowerCase() === "total";
              const isHighlight = highlight.includes(i);
              return (
                <tr key={i} className={
                  isTotal
                    ? "bg-stone-700 font-semibold"
                    : isHighlight
                    ? "bg-teal-50"
                    : i % 2 === 0 ? "bg-white" : "bg-stone-50"
                }>
                  {row.map((cell, j) => (
                    <td key={j} className={`px-3 py-2 whitespace-nowrap ${
                      isTotal ? "text-white" : j === 0 ? "text-stone-700 font-medium" : "text-stone-600"
                    }`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────
function KPI({ label, value, sub, bg, text, border }) {
  return (
    <div className={`rounded-xl border ${border} p-4`} style={{ background: bg }}>
      <p className="text-xs font-medium text-stone-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: text }}>{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Share modal ───────────────────────────────────────────────────────────
function ShareModal({ onClose, fileName, data }) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const shareText = `Lead Analysis Report — ${fileName}\n\nTotal Leads: ${data.summary.totalLeads}\nConnect: ${data.summary.connect} (${data.summary.connectPct}%)\nQualified: ${data.summary.qualified} (${data.summary.qualifiedPct}%)\nNot Qualified: ${data.summary.notQualified}\nAlt Intensity: ${data.summary.altIntensity}`;

  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const mailLink = `mailto:${email}?subject=${encodeURIComponent(`Lead Analysis - ${fileName}`)}&body=${encodeURIComponent(shareText)}`;

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-stone-800 font-bold text-lg">Share Report</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl leading-none">×</button>
        </div>

        {/* WhatsApp */}
        <a href={waLink} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 w-full bg-[#25D366] hover:bg-[#20b858] text-white font-semibold px-4 py-3 rounded-xl transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share on WhatsApp
        </a>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-600">Send via Email</label>
          <div className="flex gap-2">
            <input type="email" placeholder="recipient@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <a href={mailLink}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition whitespace-nowrap">
              Send
            </a>
          </div>
        </div>

        {/* Copy text */}
        <button onClick={copyText}
          className="flex items-center gap-2 w-full border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium px-4 py-3 rounded-xl transition text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy Summary Text"}
        </button>

        {/* Export then share */}
        <div className="flex gap-2 pt-1 border-t border-stone-100">
          <button onClick={() => exportToExcel(data, fileName?.replace(/\.xlsx$/i, "") || "report")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2.5 rounded-xl transition">
            Download Excel
          </button>
          <button onClick={() => exportToPDF(data, fileName?.replace(/\.xlsx$/i, "") || "report")}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2.5 rounded-xl transition">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard({ data, fileName }) {
  const [shareOpen, setShareOpen] = useState(false);
  const { summary, statusBreakdown, dayAnalysis, attemptAnalysis,
    timeRangeOverall, timeRangeOnline, agentBreakdown, sourceBreakdown, detectedColumns } = data;

  const baseName = fileName?.replace(/\.xlsx$/i, "") || "analysis";

  const pieData = [
    { name: "Qualified",     value: summary.qualified },
    { name: "Not Qualified", value: summary.notQualified },
    { name: "Call Later",    value: summary.callLater },
    { name: "Visited",       value: summary.visited },
    { name: "Inactive",      value: summary.inactive },
    { name: "No Connect",    value: summary.totalLeads - summary.connect },
  ].filter(d => d.value > 0);

  const dayBarData = dayAnalysis.map(r => ({
    name: r.day, Connect: r.connect, Qualified: r.qualified, "Not Qual.": r.notQualified,
  }));

  const attemptBarData = attemptAnalysis.map(r => ({
    name: String(r.attempt), Connect: r.connect, Qualified: r.qualified,
  }));

  const tooltipStyle = { background: "#fff", border: "1px solid #e7e5e4", borderRadius: 8, color: "#292524", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm">
        <div>
          <h2 className="text-stone-800 font-bold text-xl">Analysis Report</h2>
          <p className="text-stone-400 text-sm mt-0.5">{fileName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => exportToExcel(data, baseName)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button onClick={() => exportToPDF(data, baseName)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
          <button onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 bg-stone-700 hover:bg-stone-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* ── Detected columns ── */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
        <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">Auto-detected Column Mapping</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(detectedColumns).map(([field, col]) => (
            <span key={field} className="inline-flex items-center gap-1 bg-white border border-teal-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-stone-500">{field}</span>
              <span className="text-teal-600 font-bold">→</span>
              <span className="text-stone-800 font-semibold">{col}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPI label="Total Leads"    value={summary.totalLeads}    bg="#f0fdf4" text={C.green}  border="border-green-200" />
        <KPI label="Total Attempts" value={summary.totalAttempts} sub={`Intensity: ${summary.altIntensity}`} bg="#fffbeb" text={C.amber}  border="border-amber-200" />
        <KPI label="Connect"        value={summary.connect}       sub={`${summary.connectPct}% of leads`}    bg="#f0f9ff" text={C.blue}   border="border-blue-200" />
        <KPI label="Qualified"      value={summary.qualified}     sub={`${summary.qualifiedPct}% of connects`} bg="#f0fdfa" text={C.teal} border="border-teal-200" />
        <KPI label="Not Qualified"  value={summary.notQualified}  sub={`${summary.notQualifiedPct}% of connects`} bg="#fff1f2" text={C.rose} border="border-rose-200" />
      </div>

      {/* ── Two summary tables side by side (matching image) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DataTable
          title="Fresh Leads — Created Date"
          headers={["Status", "Count"]}
          rows={[
            ["Total Leads",              summary.totalLeads],
            ["Total Attempt",            summary.totalAttempts],
            ["Meaningful Connect",       summary.connect],
            ["Meaningful Connect %",     summary.connectPct + "%"],
            ["Qualified",                summary.qualified],
            ["Lead - Qua%",              summary.qualifiedPct + "%"],
            ["Attempted to Contact",     summary.attemptedToContact],
            ["Inactive",                 summary.inactive],
            ["Not Qualified",            summary.notQualified],
            ["Call Later",               summary.callLater],
            ["Visited",                  summary.visited],
            ["Q to V%",                  summary.qToVPct + "%"],
            ["Alt Intensity",            summary.altIntensity],
            ["ATC + Inactive",           summary.atcInactive],
            ["ATC + Inactive Attempts",  summary.atcInactiveAttempts],
            ["ATC + Inactive Intensity", summary.atcInactiveIntensity],
          ]}
        />
        <DataTable
          title="Status Breakdown"
          headers={["Status", "Count", "%"]}
          rows={Object.entries(statusBreakdown).map(([k, v]) => [
            k, v, ((v / summary.totalLeads) * 100).toFixed(1) + "%",
          ])}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-stone-700 font-semibold text-sm mb-4">Lead Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#78716c", fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-stone-700 font-semibold text-sm mb-4">Day-wise Analysis</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dayBarData} barSize={16} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#78716c", fontSize: 11 }} />
              <Bar dataKey="Connect"    fill={C.blue}  radius={[3, 3, 0, 0]} />
              <Bar dataKey="Qualified"  fill={C.teal}  radius={[3, 3, 0, 0]} />
              <Bar dataKey="Not Qual."  fill={C.rose}  radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Day Range tables (count + %) — exact match to image ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DataTable
          title="Day Range — Count"
          headers={["Day Range", "Connect", "Qualified", "Not Qualified"]}
          rows={[
            ...dayAnalysis.map(r => [r.day, r.connect, r.qualified, r.notQualified]),
            ["Total", summary.connect, summary.qualified, summary.notQualified],
          ]}
        />
        <DataTable
          title="Day Range — %"
          headers={["Day Range", "Connect %", "Qualified %", "Not Qualified %"]}
          rows={[
            ...dayAnalysis.map(r => [r.day, r.connectPct + "%", r.qualifiedPct + "%", r.notQualifiedPct + "%"]),
            ["Total", "100%", "100%", "100%"],
          ]}
        />
      </div>

      {/* ── Attempt tables (count + %) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DataTable
          title="Attempts — Count"
          headers={["Attempts", "Connect", "Qualified", "Not Qualified"]}
          rows={[
            ...attemptAnalysis.map(r => [r.attempt, r.connect, r.qualified, r.notQualified]),
            ["Total", summary.connect, summary.qualified, summary.notQualified],
          ]}
        />
        <DataTable
          title="Attempts — %"
          headers={["Attempts", "Connect %", "Qualified %", "Not Qualified %"]}
          rows={[
            ...attemptAnalysis.map(r => [r.attempt, r.connectPct + "%", r.qualifiedPct + "%", r.notQualifiedPct + "%"]),
            ["Total", "100%", "100%", "100%"],
          ]}
        />
      </div>

      {/* ── Attempt bar chart ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-stone-700 font-semibold text-sm mb-4">Attempt-wise Breakdown</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={attemptBarData} barSize={20} barGap={3}>
            <XAxis dataKey="name" tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: "#78716c", fontSize: 11 }} />
            <Bar dataKey="Connect"   fill={C.blue}  radius={[3, 3, 0, 0]} />
            <Bar dataKey="Qualified" fill={C.teal}  radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Time Range tables (Overall + Online) — exact match to image ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DataTable
          title="Overall — Time Range (First Attempts)"
          headers={["Time Range", "First Attempts", "%"]}
          rows={[
            ...timeRangeOverall.map(r => [r.range, r.count, r.pct + "%"]),
            ["Total", summary.totalLeads, "100%"],
          ]}
        />
        <DataTable
          title="Online — Time Range (First Attempts)"
          headers={["Time Range", "First Attempts", "%"]}
          rows={[
            ...timeRangeOnline.map(r => [r.range, r.count, r.pct + "%"]),
            ["Total", summary.connect, "100%"],
          ]}
        />
      </div>

      {/* ── Agent breakdown (only if detected) ── */}
      {agentBreakdown?.length > 0 && (
        <DataTable
          title="Agent-wise Breakdown"
          headers={["Agent", "Total", "Connect", "Qualified", "Not Qualified", "Connect %", "Qualified %", "Intensity"]}
          rows={agentBreakdown.map(r => [
            r.agent, r.total, r.connect, r.qualified, r.notQualified,
            r.connectPct + "%", r.qualifiedPct + "%", r.intensity,
          ])}
        />
      )}

      {/* ── Source breakdown (only if detected) ── */}
      {sourceBreakdown?.length > 0 && (
        <DataTable
          title="Source-wise Breakdown"
          headers={["Source", "Total", "Connect", "Qualified", "Connect %"]}
          rows={sourceBreakdown.map(r => [r.source, r.total, r.connect, r.qualified, r.connectPct + "%"])}
        />
      )}

      {shareOpen && <ShareModal onClose={() => setShareOpen(false)} fileName={fileName} data={data} />}
    </div>
  );
}
