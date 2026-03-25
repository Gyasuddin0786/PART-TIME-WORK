const normalize = (str) => String(str).toLowerCase().replace(/[\s_\-\.#\/\\()]+/g, "");

// Every field has broad keyword coverage so ANY real-world Excel column name matches
const COLUMN_KEYWORDS = {
  leadStatus:    ["status", "leadstatus", "state", "leadstate", "disposition", "callstatus", "callstate", "outcome", "result"],
  createdTime:   ["created", "createdat", "createdon", "creationdate", "creationtime", "addeddate", "addedtime", "entrydate", "entrytime", "uploaddate", "date", "startdate"],
  modifiedTime:  ["modified", "modifiedat", "modifiedon", "updated", "updatedat", "updatedon", "lastmodified", "lastupdated", "lastcall", "lastcalldate", "lastcalltime"],
  attempts:      ["attempt", "noofattempt", "totalattempt", "callcount", "dialcount", "trycount", "tries", "noofcall", "totalcall", "callsmade", "dials"],
  callDuration:  ["duration", "callduration", "talktime", "calltime", "timetaken", "timespent", "calllen", "calllength", "minutes", "seconds", "mins", "secs"],
  agentName:     ["agent", "agentname", "caller", "callername", "executive", "rep", "salesperson", "assignedto", "owner", "username", "user", "employee"],
  phone:         ["phone", "mobile", "contact", "number", "cell", "phoneno", "mobileno", "contactno", "phonenumber", "mobilenumber"],
  leadName:      ["name", "leadname", "customername", "clientname", "prospect", "fullname", "firstname", "lastname", "contactname"],
  source:        ["source", "leadsource", "channel", "medium", "campaign", "origin", "referral"],
};

function detectColumns(rowKeys, manualMap = {}) {
  const detected = {};
  const allDetected = {}; // store ALL matched columns including optional ones

  for (const [field, keywords] of Object.entries(COLUMN_KEYWORDS)) {
    if (manualMap[field]) {
      detected[field] = manualMap[field];
      allDetected[field] = manualMap[field];
      continue;
    }
    const match = rowKeys.find((key) => {
      const norm = normalize(key);
      return keywords.some((kw) => norm.includes(kw));
    });
    if (match) {
      detected[field] = match;
      allDetected[field] = match;
    }
  }

  // Required fields — only leadStatus is truly required; rest degrade gracefully
  const required = ["leadStatus"];
  const missing = required.filter((f) => !detected[f]);

  return { detected: allDetected, missing };
}

module.exports = { detectColumns };
