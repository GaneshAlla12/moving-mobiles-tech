import { google, type sheets_v4 } from "googleapis";

/**
 * Google Sheets — Customer Leads helper.
 *
 * Reads/writes the "Customer Leads" tab in the Moving Mobiles Database
 * spreadsheet using a service account. Used by the staff Customer Requests
 * page (/staff/leads) to display leads captured by the n8n + VAPI AI agent
 * and let staff mark them as contacted.
 *
 * GROUPING: Maria the AI sometimes saves a lead multiple times during a
 * single call (e.g. once at buying-intent, once before transferring). To
 * avoid showing duplicate cards on the staff page, rows with the same
 * phone+email are grouped into a single Lead with a request timeline.
 *
 * Required env vars:
 *   - GOOGLE_SHEETS_LEADS_ID         spreadsheet ID
 *   - GOOGLE_SERVICE_ACCOUNT_JSON    full JSON of the service account key
 */

const SHEET_NAME = "Customer Leads";
// Columns A..I: Name | Phone | Email | Customer Request | Timestamp | Status |
//               Contacted At | Contacted By | Call Status
const SHEET_RANGE = `${SHEET_NAME}!A:I`;

export type LeadRequestEntry = {
  text: string;        // the Customer Request text (may include prefix)
  timestamp: string;   // ISO timestamp of when this entry was saved
};

export type Lead = {
  /** Most-recent row index in this group (1-indexed). Used as a stable React key. */
  rowIndex: number;
  /** All sheet row indexes that belong to this lead group. */
  rowIndexes: number[];
  customerName: string;
  phoneNumber: string;
  email: string;
  /** Most recent customer request text (for backward compat). */
  customerRequest: string;
  /** Timeline of all saved requests in this group (oldest first). */
  requests: LeadRequestEntry[];
  /** Most recent timestamp in the group (ISO). */
  timestamp: string;
  status: "New" | "Contacted" | "";
  contactedAt: string;
  contactedBy: string;
  /** True if ANY row in the group is an after-hours call. */
  isAfterHours: boolean;
  /**
   * Most recent call-transfer status across all rows in this group.
   * - "Missed"    — Maria transferred the call but the store rep didn't pick up.
   * - "Connected" — Transfer completed successfully.
   * - ""          — No transfer was attempted, or status unknown.
   * Set by the VAPI webhook at /api/vapi/events.
   */
  callStatus: "Missed" | "Connected" | "";
  /** Derived: callStatus === "Missed" AND status !== "Contacted" → needs urgent callback. */
  isMissedCallback: boolean;
};

type RawRow = {
  rowIndex: number;
  customerName: string;
  phoneNumber: string;
  email: string;
  customerRequest: string;
  timestamp: string;
  status: string;
  contactedAt: string;
  contactedBy: string;
  callStatus: string;
};

let cachedClient: sheets_v4.Sheets | null = null;

function getSheetsClient(): sheets_v4.Sheets {
  if (cachedClient) return cachedClient;

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is not set");
  }

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(raw);
  } catch (e) {
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON: ${(e as Error).message}`,
    );
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
}

function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_LEADS_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEETS_LEADS_ID env var is not set");
  }
  return id;
}

/** Fetch all leads, grouped by phone+email, newest first. */
export async function listLeads(): Promise<Lead[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });

  const rows = res.data.values ?? [];
  if (rows.length <= 1) return [];

  const raw: RawRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const customerName = String(r[0] ?? "").trim();
    const phoneNumber = normalizePhone(String(r[1] ?? "").trim());
    const email = normalizeEmail(String(r[2] ?? "").trim());
    const customerRequest = String(r[3] ?? "").trim();
    const timestamp = String(r[4] ?? "").trim();
    const status = String(r[5] ?? "").trim();
    const contactedAt = String(r[6] ?? "").trim();
    const contactedBy = String(r[7] ?? "").trim();
    const callStatus = String(r[8] ?? "").trim();

    if (!customerName && !phoneNumber && !email && !customerRequest) continue;

    raw.push({
      rowIndex: i + 1,
      customerName,
      phoneNumber,
      email,
      customerRequest,
      timestamp,
      status,
      contactedAt,
      contactedBy,
      callStatus,
    });
  }

  // Group rows by phone+email. Empty phone+email rows stand alone.
  const groups = new Map<string, RawRow[]>();
  for (const row of raw) {
    const hasContact = Boolean(row.phoneNumber || row.email);
    const key = hasContact
      ? `${row.phoneNumber}|${row.email}`
      : `__row_${row.rowIndex}`;
    const arr = groups.get(key);
    if (arr) arr.push(row);
    else groups.set(key, [row]);
  }

  const leads: Lead[] = [];
  for (const items of groups.values()) {
    // Sort group oldest → newest so the timeline reads in order.
    items.sort((a, b) => {
      const ta = Date.parse(a.timestamp);
      const tb = Date.parse(b.timestamp);
      if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
      return a.rowIndex - b.rowIndex;
    });

    const newest = items[items.length - 1];

    // Best customer name: first non-empty (rows might be saved before the
    // customer gave their name).
    const customerName =
      items.map((r) => r.customerName).find((n) => n) ?? "";

    // Status: Contacted if any row in the group is marked Contacted.
    const contactedRow = items.find((r) => r.status === "Contacted");
    const status: Lead["status"] = contactedRow ? "Contacted" : "New";

    // Call status: prefer the newest non-empty call status across rows.
    let callStatus: Lead["callStatus"] = "";
    for (let i = items.length - 1; i >= 0; i--) {
      const cs = items[i].callStatus;
      if (cs === "Missed" || cs === "Connected") {
        callStatus = cs;
        break;
      }
    }

    const requests: LeadRequestEntry[] = items
      .filter((r) => r.customerRequest)
      .map((r) => ({ text: r.customerRequest, timestamp: r.timestamp }));

    leads.push({
      rowIndex: newest.rowIndex,
      rowIndexes: items.map((r) => r.rowIndex),
      customerName,
      phoneNumber: newest.phoneNumber,
      email: newest.email,
      customerRequest: newest.customerRequest,
      requests,
      timestamp: newest.timestamp,
      status,
      contactedAt: contactedRow?.contactedAt ?? "",
      contactedBy: contactedRow?.contactedBy ?? "",
      isAfterHours: items.some((r) =>
        r.customerRequest.startsWith("AFTER-HOURS CALL -"),
      ),
      callStatus,
      isMissedCallback: callStatus === "Missed" && status !== "Contacted",
    });
  }

  // Sort newest first.
  leads.sort((a, b) => {
    const ta = Date.parse(a.timestamp);
    const tb = Date.parse(b.timestamp);
    if (Number.isFinite(ta) && Number.isFinite(tb)) return tb - ta;
    return b.rowIndex - a.rowIndex;
  });

  return leads;
}

/**
 * Mark every row in a lead group as Contacted. The staff page passes the
 * group's full `rowIndexes` array so duplicates collapse together.
 */
export async function markContacted(input: {
  rowIndexes: number[];
  contactedBy: string;
}): Promise<{ ok: true; count: number }> {
  const { rowIndexes, contactedBy } = input;
  const valid = rowIndexes.filter((n) => Number.isInteger(n) && n >= 2);
  if (valid.length === 0) {
    throw new Error("rowIndexes must contain at least one integer >= 2");
  }
  if (!contactedBy.trim()) {
    throw new Error("contactedBy is required");
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: valid.map((rowIndex) => ({
        range: `${SHEET_NAME}!F${rowIndex}:H${rowIndex}`,
        values: [["Contacted", now, contactedBy]],
      })),
    },
  });

  return { ok: true, count: valid.length };
}

/** Revert a lead group back to New (un-mark contacted across all its rows). */
export async function unmarkContacted(input: {
  rowIndexes: number[];
}): Promise<{ ok: true; count: number }> {
  const { rowIndexes } = input;
  const valid = rowIndexes.filter((n) => Number.isInteger(n) && n >= 2);
  if (valid.length === 0) {
    throw new Error("rowIndexes must contain at least one integer >= 2");
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: valid.map((rowIndex) => ({
        range: `${SHEET_NAME}!F${rowIndex}:H${rowIndex}`,
        values: [["New", "", ""]],
      })),
    },
  });

  return { ok: true, count: valid.length };
}

/**
 * Append a new lead row. Called by /api/vapi/save-lead when Maria saves a
 * customer's contact details + request. Status column is initialized to
 * "New" so the staff portal picks it up in the Inbox.
 */
export async function appendLead(input: {
  customerName: string;
  phoneNumber: string;
  email: string;
  customerRequest: string;
}): Promise<{ ok: true; rowIndex?: number }> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const timestamp = new Date().toISOString();

  // Columns A..I, but we only fill A..F (G/H/I left blank until staff acts).
  const values = [
    [
      input.customerName.trim(),
      input.phoneNumber.replace(/\s+/g, ""),
      input.email.trim(),
      input.customerRequest.trim(),
      timestamp,
      "New",
    ],
  ];

  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  // Parse the rowIndex from the updatedRange (e.g. "Customer Leads!A37:F37").
  const updatedRange = res.data.updates?.updatedRange ?? "";
  const match = updatedRange.match(/!A(\d+):/);
  const rowIndex = match ? Number(match[1]) : undefined;

  return { ok: true, rowIndex };
}

/**
 * Update the Call Status column (column I) for one or more rows. Used by
 * the VAPI webhook when it detects a missed transfer or a successful one.
 */
export async function markCallStatus(input: {
  rowIndexes: number[];
  status: "Missed" | "Connected" | "";
}): Promise<{ ok: true; count: number }> {
  const valid = input.rowIndexes.filter((n) => Number.isInteger(n) && n >= 2);
  if (valid.length === 0) {
    throw new Error("rowIndexes must contain at least one integer >= 2");
  }

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: "RAW",
      data: valid.map((rowIndex) => ({
        range: `${SHEET_NAME}!I${rowIndex}`,
        values: [[input.status]],
      })),
    },
  });

  return { ok: true, count: valid.length };
}

/**
 * Find the most recent lead rows whose phone number matches the given input.
 * Returns the row indexes (oldest to newest) so the caller can update the
 * Call Status column. Useful when the VAPI webhook needs to attach status to
 * a lead Maria just saved.
 *
 * Phone match is digit-only, suffix match (so "+12407286051" matches the
 * row containing "2407286051").
 */
export async function findLatestLeadRowIndexesByPhone(
  phone: string,
  options: { withinMinutes?: number } = {},
): Promise<number[]> {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];

  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: SHEET_RANGE,
  });

  const rows = res.data.values ?? [];
  if (rows.length <= 1) return [];

  const within = options.withinMinutes ?? 60;
  const cutoff = Date.now() - within * 60 * 1000;

  const matches: { rowIndex: number; ts: number }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r) continue;
    const rowPhone = normalizePhone(String(r[1] ?? "").trim());
    if (!rowPhone) continue;
    // Suffix match: handles +1, 1-prefix, country code variations.
    if (
      rowPhone === normalized ||
      rowPhone.endsWith(normalized) ||
      normalized.endsWith(rowPhone)
    ) {
      const timestamp = String(r[4] ?? "").trim();
      const ts = Date.parse(timestamp);
      if (Number.isFinite(ts) && ts >= cutoff) {
        matches.push({ rowIndex: i + 1, ts });
      }
    }
  }

  matches.sort((a, b) => a.ts - b.ts);
  return matches.map((m) => m.rowIndex);
}

/** Strip everything except digits — helps group rows even if the AI saved
 *  the phone with/without dashes, spaces, or country code prefixes. */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Lowercase + trim. Helps group when the AI sometimes capitalizes emails. */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
