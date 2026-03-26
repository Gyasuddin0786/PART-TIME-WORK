import { useState, useRef } from "react";
import api from "../api";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";
export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  const [missingCols, setMissingCols] = useState([]);
  const [availableCols, setAvailableCols] = useState([]);
  const [manualMap, setManualMap] = useState({});
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith(".xlsx")) { setMsg({ type: "error", text: "Only .xlsx files supported" }); return; }
    setFile(f); setData(null); setMissingCols([]);
    setMsg({ type: "success", text: `${f.name} ready to analyse` });
  };

  const analyze = async (override = {}) => {
    if (!file) { setMsg({ type: "error", text: "Select a file first" }); return; }
    const fd = new FormData();
    fd.append("file", file);
    if (Object.keys(override).length) fd.append("manualMap", JSON.stringify(override));
    try {
      setLoading(true); setMsg(null);
      const res = await api.post("/upload", fd);
      setData(res.data); setMissingCols([]);
      setMsg({ type: "success", text: "Analysis complete!" });
    } catch (err) {
      const e = err.response?.data;
      if (e?.missing) {
        setMissingCols(e.missing); setAvailableCols(e.availableColumns || []);
        setMsg({ type: "error", text: e.error });
      } else {
        setMsg({ type: "error", text: e?.error || "Something went wrong" });
      }
    } finally { setLoading(false); }
  };

  return (
    <>
        <Navbar/>

    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Upload & Analyse</h2>
        <p className="text-stone-500 text-sm mt-0.5">Upload any Excel file — columns are auto-detected automatically</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${
          dragging ? "border-teal-400 bg-teal-50" : "border-stone-300 bg-white hover:border-teal-400 hover:bg-teal-50/50"
        }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={e => pickFile(e.target.files[0])} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${dragging ? "bg-teal-600" : "bg-stone-100"}`}>
            <svg className={`w-7 h-7 ${dragging ? "text-white" : "text-stone-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          {file
            ? <><p className="text-stone-800 font-semibold">{file.name}</p><p className="text-stone-400 text-sm">{(file.size / 1024).toFixed(1)} KB · Click to change</p></>
            : <><p className="text-stone-700 font-semibold">Drop your Excel file here</p><p className="text-stone-400 text-sm">or click to browse · .xlsx only</p></>
          }
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
          msg.type === "error"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-green-50 border border-green-200 text-green-700"
        }`}>
          {msg.type === "error" ? "⚠️" : "✅"} {msg.text}
        </div>
      )}

      {/* Manual Mapping */}
      {missingCols.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
          <p className="text-amber-800 font-semibold text-sm">Map missing columns manually</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {missingCols.map(field => (
              <div key={field} className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl p-3">
                <span className="text-stone-700 text-sm font-medium w-32 shrink-0">{field}</span>
                <select className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  defaultValue="" onChange={e => setManualMap(p => ({ ...p, [field]: e.target.value }))}>
                  <option value="" disabled>Select column...</option>
                  {availableCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => analyze(manualMap)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            Re-analyse with Manual Mapping
          </button>
        </div>
      )}

      {/* Analyse Button */}
      {!missingCols.length && (
        <button onClick={() => analyze()} disabled={loading || !file}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm text-sm">
          {loading
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Analysing...</>
            : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Analyse</>
          }
        </button>
      )}

      {data && <Dashboard data={data} fileName={file?.name} />}
    </div>
    </>
  );
}