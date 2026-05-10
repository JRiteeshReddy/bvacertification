import { createFileRoute } from "@tanstack/react-router";

const SPREADSHEET_ID = "1KS2-jWHtHyTRTFOSqIMeCYRLEQItGSA8yjXmpbgKQYM";
const SHEET_NAME = "Certificates";
const RANGE = `${SHEET_NAME}!A1:E10000`;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

type Certificate = {
  certificateId: string;
  teamMembers: string;
  eventName: string;
  position: string;
  date: string;
};

function rowToCertificate(row: string[]): Certificate {
  return {
    certificateId: (row[0] ?? "").trim(),
    teamMembers: (row[1] ?? "").trim(),
    eventName: (row[2] ?? "").trim(),
    position: (row[3] ?? "").trim(),
    date: (row[4] ?? "").trim(),
  };
}

export const Route = createFileRoute("/api/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = (url.searchParams.get("id") ?? "").trim();

        if (!id) {
          return Response.json(
            { ok: false, error: "Missing certificate ID" },
            { status: 400 },
          );
        }

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
        if (!LOVABLE_API_KEY) {
          return Response.json(
            { ok: false, error: "LOVABLE_API_KEY not configured" },
            { status: 500 },
          );
        }
        if (!GOOGLE_SHEETS_API_KEY) {
          return Response.json(
            { ok: false, error: "GOOGLE_SHEETS_API_KEY not configured" },
            { status: 500 },
          );
        }

        const sheetsUrl = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;
        const res = await fetch(sheetsUrl, {
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          return Response.json(
            { ok: false, error: `Sheets fetch failed [${res.status}]: ${text}` },
            { status: 502 },
          );
        }

        const data = (await res.json()) as { values?: string[][] };
        const rows = data.values ?? [];
        if (rows.length <= 1) {
          return Response.json({ ok: false, error: "Not found" }, { status: 404 });
        }

        const needle = id.toLowerCase();
        const match = rows.slice(1).find(
          (r) => (r[0] ?? "").trim().toLowerCase() === needle,
        );

        if (!match) {
          return Response.json({ ok: false, error: "Not found" }, { status: 404 });
        }

        return Response.json({ ok: true, certificate: rowToCertificate(match) });
      },
    },
  },
});