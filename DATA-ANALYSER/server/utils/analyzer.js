const CONNECT_STATUSES = new Set(["qualified", "not qualified", "notqualified", "call later", "calllater", "visited", "callback", "interested", "follow up", "followup"]);
const QUALIFIED_STATUSES = new Set(["qualified"]);
const NOT_QUALIFIED_STATUSES = new Set(["not qualified", "notqualified", "not_qualified"]);
const INACTIVE_STATUSES = new Set(["inactive", "not reachable", "notreachable", "no answer", "noanswer", "busy", "switched off", "switchedoff", "dnc", "do not call"]);

const norm = (v) => String(v || "").toLowerCase().trim();

function parseDate(val) {
  if (!val) return null;
  if (typeof val === "number") {
    // Excel serial date
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function getDayLabel(created, modified) {
  const c = parseDate(created);
  const m = parseDate(modified);
  if (!c || !m) return null;
  const diff = Math.floor((m - c) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Same Day";
  if (diff === 1) return "Day 1";
  if (diff === 2) return "Day 2";
  if (diff === 3) return "Day 3";
  return null;
}

function getTimeRangeLabel(secs) {
  const mins = secs / 60;
  if (mins <= 5) return "0 - 5 Min";
  if (mins <= 10) return "5 - 10 Min";
  if (mins <= 20) return "10 - 20 Min";
  return ">20 Min";
}

function parseDuration(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const str = String(val).trim();
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(str) || 0;
}

const pct = (n, d) => (d ? +((n / d) * 100).toFixed(1) : 0);

exports.processLeads = (data, detected) => {
  const { leadStatus, createdTime, modifiedTime, attempts, callDuration, agentName, source } = detected;

  let totalLeads = data.length;
  let totalAttempts = 0;
  let connect = 0, qualified = 0, notQualified = 0, callLater = 0, visited = 0, inactive = 0;
  let attemptedToContact = 0;

  const statusBreakdown = {};
  const dayBuckets = {
    "Same Day": { connect: 0, qualified: 0, notQualified: 0 },
    "Day 1":    { connect: 0, qualified: 0, notQualified: 0 },
    "Day 2":    { connect: 0, qualified: 0, notQualified: 0 },
    "Day 3":    { connect: 0, qualified: 0, notQualified: 0 },
  };
  const attemptBuckets = {
    1: { connect: 0, qualified: 0, notQualified: 0 },
    2: { connect: 0, qualified: 0, notQualified: 0 },
    3: { connect: 0, qualified: 0, notQualified: 0 },
    4: { connect: 0, qualified: 0, notQualified: 0 },
    5: { connect: 0, qualified: 0, notQualified: 0 },
    ">5": { connect: 0, qualified: 0, notQualified: 0 },
  };
  const timeOverall = { "0 - 5 Min": 0, "5 - 10 Min": 0, "10 - 20 Min": 0, ">20 Min": 0 };
  const timeOnline  = { "0 - 5 Min": 0, "5 - 10 Min": 0, "10 - 20 Min": 0, ">20 Min": 0 };
  const agentMap = {};
  const sourceMap = {};

  data.forEach((row) => {
    const statusRaw  = row[leadStatus];
    const statusN    = norm(statusRaw);
    const attemptCnt = parseInt(row[attempts]) || 0;
    const created    = row[createdTime];
    const modified   = row[modifiedTime];
    const duration   = parseDuration(row[callDuration]);
    const agent      = agentName && row[agentName] ? String(row[agentName]).trim() : null;
    const src        = source && row[source] ? String(row[source]).trim() : null;

    // raw status count
    if (statusRaw) {
      const k = String(statusRaw).trim();
      statusBreakdown[k] = (statusBreakdown[k] || 0) + 1;
    }

    totalAttempts += attemptCnt;

    const isConnect     = CONNECT_STATUSES.has(statusN);
    const isQualified   = QUALIFIED_STATUSES.has(statusN);
    const isNotQual     = NOT_QUALIFIED_STATUSES.has(statusN);
    const isInactive    = INACTIVE_STATUSES.has(statusN);
    const isCallLater   = statusN === "call later" || statusN === "calllater";
    const isVisited     = statusN === "visited";

    if (isConnect)   connect++;
    if (isQualified) qualified++;
    if (isNotQual)   notQualified++;
    if (isCallLater) callLater++;
    if (isVisited)   visited++;
    if (isInactive)  inactive++;
    if (attemptCnt > 0) attemptedToContact++;

    // Day buckets — % will be of connect total (matching image)
    const dayLabel = getDayLabel(created, modified);
    if (dayLabel && dayBuckets[dayLabel]) {
      if (isConnect)   dayBuckets[dayLabel].connect++;
      if (isQualified) dayBuckets[dayLabel].qualified++;
      if (isNotQual)   dayBuckets[dayLabel].notQualified++;
    }

    // Attempt buckets
    const bk = attemptCnt > 5 ? ">5" : attemptCnt > 0 ? attemptCnt : null;
    if (bk !== null && attemptBuckets[bk]) {
      if (isConnect)   attemptBuckets[bk].connect++;
      if (isQualified) attemptBuckets[bk].qualified++;
      if (isNotQual)   attemptBuckets[bk].notQualified++;
    }

    // Time range
    if (duration > 0) {
      const tl = getTimeRangeLabel(duration);
      timeOverall[tl]++;
      if (isConnect) timeOnline[tl]++;
    }

    // Agent
    if (agent) {
      if (!agentMap[agent]) agentMap[agent] = { total: 0, connect: 0, qualified: 0, notQualified: 0, attempts: 0 };
      agentMap[agent].total++;
      agentMap[agent].attempts += attemptCnt;
      if (isConnect)   agentMap[agent].connect++;
      if (isQualified) agentMap[agent].qualified++;
      if (isNotQual)   agentMap[agent].notQualified++;
    }

    // Source
    if (src) {
      if (!sourceMap[src]) sourceMap[src] = { total: 0, connect: 0, qualified: 0 };
      sourceMap[src].total++;
      if (isConnect)   sourceMap[src].connect++;
      if (isQualified) sourceMap[src].qualified++;
    }
  });

  // ── Day analysis — connectPct = connect/totalConnect (matches image: 65/98=66%)
  const dayAnalysis = Object.entries(dayBuckets).map(([day, v]) => ({
    day,
    connect:      v.connect,
    qualified:    v.qualified,
    notQualified: v.notQualified,
    connectPct:      pct(v.connect,      connect || 1),   // % of total connects
    qualifiedPct:    pct(v.qualified,    qualified || 1),  // % of total qualified
    notQualifiedPct: pct(v.notQualified, notQualified || 1),
  }));

  // ── Attempt analysis — % of respective totals
  const attemptAnalysis = Object.entries(attemptBuckets).map(([attempt, v]) => ({
    attempt,
    connect:      v.connect,
    qualified:    v.qualified,
    notQualified: v.notQualified,
    connectPct:      pct(v.connect,      connect || 1),
    qualifiedPct:    pct(v.qualified,    qualified || 1),
    notQualifiedPct: pct(v.notQualified, notQualified || 1),
  }));

  const atcInactive          = attemptedToContact + inactive;
  const atcInactiveAttempts  = totalAttempts;
  const atcInactiveIntensity = atcInactive ? +(atcInactiveAttempts / atcInactive).toFixed(2) : 0;

  return {
    summary: {
      totalLeads,
      totalAttempts,
      connect,
      connectPct:    pct(connect, totalLeads),
      qualified,
      qualifiedPct:  pct(qualified, connect || 1),
      notQualified,
      notQualifiedPct: pct(notQualified, connect || 1),
      callLater,
      visited,
      qToVPct:       pct(qualified, visited || 1),
      inactive,
      attemptedToContact,
      atcInactive,
      atcInactiveAttempts,
      atcInactiveIntensity,
      altIntensity:  totalLeads ? +(totalAttempts / totalLeads).toFixed(2) : 0,
    },
    statusBreakdown,
    dayAnalysis,
    attemptAnalysis,
    timeRangeOverall: Object.entries(timeOverall).map(([range, count]) => ({
      range, count, pct: pct(count, totalLeads),
    })),
    timeRangeOnline: Object.entries(timeOnline).map(([range, count]) => ({
      range, count, pct: pct(count, connect || 1),
    })),
    agentBreakdown: Object.entries(agentMap).map(([agent, v]) => ({
      agent, ...v,
      connectPct:   pct(v.connect, v.total),
      qualifiedPct: pct(v.qualified, v.connect || 1),
      intensity:    v.total ? +(v.attempts / v.total).toFixed(2) : 0,
    })),
    sourceBreakdown: Object.entries(sourceMap).map(([src, v]) => ({
      source: src, ...v,
      connectPct: pct(v.connect, v.total),
    })),
    detectedColumns: detected,
  };
};
