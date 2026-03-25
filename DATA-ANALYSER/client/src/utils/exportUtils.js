import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function buildSheets(data) {
  const { summary, statusBreakdown, dayAnalysis, attemptAnalysis, timeRangeOverall, timeRangeOnline, agentBreakdown, sourceBreakdown } = data;
  return {
    Summary: [
      ["Metric", "Value"],
      ["Total Leads", summary.totalLeads],
      ["Total Attempts", summary.totalAttempts],
      ["Connect", summary.connect],
      ["Connect %", summary.connectPct + "%"],
      ["Qualified", summary.qualified],
      ["Qualified %", summary.qualifiedPct + "%"],
      ["Not Qualified", summary.notQualified],
      ["Call Later", summary.callLater],
      ["Visited", summary.visited],
      ["Inactive", summary.inactive],
      ["Attempted to Contact", summary.attemptedToContact],
      ["Alt Intensity", summary.altIntensity],
    ],
    "Status Breakdown": [
      ["Status", "Count"],
      ...Object.entries(statusBreakdown || {}).map(([k, v]) => [k, v]),
    ],
    "Day Analysis": [
      ["Day", "Connect", "Qualified", "Not Qualified", "Connect %", "Qualified %", "Not Qualified %"],
      ...(dayAnalysis || []).map(r => [r.day, r.connect, r.qualified, r.notQualified, r.connectPct + "%", r.qualifiedPct + "%", r.notQualifiedPct + "%"]),
    ],
    "Attempt Analysis": [
      ["Attempt", "Connect", "Qualified", "Not Qualified", "Connect %", "Qualified %", "Not Qualified %"],
      ...(attemptAnalysis || []).map(r => [r.attempt, r.connect, r.qualified, r.notQualified, r.connectPct + "%", r.qualifiedPct + "%", r.notQualifiedPct + "%"]),
    ],
    "Time Range Overall": [
      ["Time Range", "Count", "%"],
      ...(timeRangeOverall || []).map(r => [r.range, r.count, r.pct + "%"]),
    ],
    "Time Range Online": [
      ["Time Range", "Count", "%"],
      ...(timeRangeOnline || []).map(r => [r.range, r.count, r.pct + "%"]),
    ],
    ...((agentBreakdown?.length) ? {
      "Agent Breakdown": [
        ["Agent", "Total", "Connect", "Qualified", "Not Qualified", "Connect %", "Qualified %"],
        ...agentBreakdown.map(r => [r.agent, r.total, r.connect, r.qualified, r.notQualified, r.connectPct + "%", r.qualifiedPct + "%"]),
      ]
    } : {}),
    ...((sourceBreakdown?.length) ? {
      "Source Breakdown": [
        ["Source", "Total", "Connect", "Qualified", "Connect %"],
        ...sourceBreakdown.map(r => [r.source, r.total, r.connect, r.qualified, r.connectPct + "%"]),
      ]
    } : {}),
  };
}

export function exportToExcel(data, fileName = "analysis") {
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(buildSheets(data))) {
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), name);
  }
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToPDF(data, fileName = "analysis") {
  const doc = new jsPDF({ orientation: "landscape" });
  let first = true;
  for (const [name, rows] of Object.entries(buildSheets(data))) {
    if (!first) doc.addPage();
    first = false;
    doc.setFontSize(13);
    doc.setTextColor(88, 28, 135);
    doc.text(name, 14, 15);
    autoTable(doc, {
      head: [rows[0]],
      body: rows.slice(1),
      startY: 20,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [88, 28, 135], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 243, 255] },
    });
  }
  doc.save(`${fileName}.pdf`);
}
