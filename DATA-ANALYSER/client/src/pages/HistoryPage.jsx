import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

const FILTERS = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "All Time", value: "all" },
];

function HistoryCard({ item }) {
  const [open, setOpen] = useState(false);
  const { result, detectedColumns, fileName, createdAt } = item;
  const { summary } = result;
  const baseName = fileName?.replace(/\.xlsx$/i, "") || "analysis";

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-stone-800 font-semibold text-sm">{fileName}</p>
            <p className="text-stone-400 text-xs">
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-4 text-xs">
            <span className="text-stone-500">
              Leads:{" "}
              <span className="text-stone-800 font-bold">
                {summary.totalLeads}
              </span>
            </span>
            <span className="text-teal-600">
              Qualified: <span className="font-bold">{summary.qualified}</span>
            </span>
            <span className="text-blue-600">
              Connect: <span className="font-bold">{summary.connectPct}%</span>
            </span>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() =>
                exportToExcel({ ...result, detectedColumns }, baseName)
              }
              className="bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 text-emerald-700 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition font-medium"
            >
              XLS
            </button>
            <button
              onClick={() =>
                exportToPDF({ ...result, detectedColumns }, baseName)
              }
              className="bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-700 hover:text-white text-xs px-2.5 py-1.5 rounded-lg transition font-medium"
            >
              PDF
            </button>
          </div>
          <svg
            className={`w-4 h-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100 p-5 space-y-4 bg-stone-50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Total Leads", summary.totalLeads],
              ["Connect", `${summary.connect} (${summary.connectPct}%)`],
              ["Qualified", `${summary.qualified} (${summary.qualifiedPct}%)`],
              ["Not Qualified", summary.notQualified],
              ["Total Attempts", summary.totalAttempts],
              ["Alt Intensity", summary.altIntensity],
              ["Call Later", summary.callLater],
              ["Inactive", summary.inactive],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-white border border-stone-200 rounded-xl p-3 text-center"
              >
                <p className="text-stone-400 text-xs">{label}</p>
                <p className="text-stone-800 font-bold mt-1 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              Day-wise
            </p>
            <div className="flex flex-wrap gap-2">
              {result.dayAnalysis?.map((r) => (
                <span
                  key={r.day}
                  className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-1 text-xs text-teal-800"
                >
                  {r.day}: <span className="font-bold">{r.connect}</span>{" "}
                  connects
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider mb-2">
              Column Mapping Used
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(detectedColumns || {}).map(([field, col]) => (
                <span
                  key={field}
                  className="bg-white border border-stone-200 rounded-lg px-3 py-1 text-xs text-stone-600"
                >
                  {field} →{" "}
                  <span className="text-stone-800 font-semibold">{col}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [filter, setFilter] = useState("month");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;

  const currentItems = history.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(history.length / itemsPerPage);
  useEffect(() => {
    setLoading(true);
    api
      .get(`/history?filter=${filter}`)
      .then((res) => setHistory(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <>
    <Navbar/>
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Upload History</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {history.length} records found
          </p>
        </div>
        <div className="flex bg-white border border-stone-200 rounded-xl p-1 gap-1 shadow-sm">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === value
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg
            className="w-8 h-8 animate-spin text-teal-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl">
          <p className="text-stone-400 text-sm">
            No uploads found for this period
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentItems.map((item) => (
            <HistoryCard key={item._id} item={item} />
          ))}
          <div className="flex justify-center items-center gap-2 mt-6">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-stone-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            {/* Page Numbers */}
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-teal-600 text-white"
                    : "bg-stone-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-stone-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
