import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

type Certificate = {
  certificateId: string;
  teamMembers: string;
  eventName: string;
  position: string;
  date: string;
};

type ApiResponse =
  | { ok: true; certificate: Certificate }
  | { ok: false; error: string };

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState(0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as ApiResponse;
      if (data.ok) {
        setResult(data.certificate);
      } else {
        setError("Invalid Certificate ID");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setResultKey((k) => k + 1);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* subtle background grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            {/* BVA Logo placeholder — replace src after upload */}
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card glow-card">
              <span className="text-2xl font-extrabold tracking-tight">BVA</span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Certificate Verification
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Enter your certificate ID below to verify its authenticity with the
              Bangalore Vibe Coders Association.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="mx-auto mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row animate-fade-in-up"
            style={{ animationDelay: "80ms" }}
          >
            <label htmlFor="cert-id" className="sr-only">
              Enter Certificate ID
            </label>
            <input
              id="cert-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter Certificate ID"
              autoComplete="off"
              className="h-12 flex-1 rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="submit"
              disabled={loading || !id.trim()}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Verifying</span>
                </>
              ) : (
                "Verify"
              )}
            </button>
          </form>

          <div className="mx-auto mt-8 w-full max-w-md" aria-live="polite">
            {result && (
              <ResultCard key={resultKey} certificate={result} />
            )}
            {error && <ErrorCard key={resultKey} message={error} />}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        Bangalore Vibe Coding Association — Independent Developer Community
      </footer>
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
      style={{ animation: "spin 0.7s linear infinite" }}
    />
  );
}

function ResultCard({ certificate }: { certificate: Certificate }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-border bg-card p-6 glow-card">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          Verified
        </span>
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {certificate.certificateId}
        </span>
      </div>

      <dl className="space-y-4">
        <Field label="Team Members" value={certificate.teamMembers} />
        <Field label="Event" value={certificate.eventName} />
        <Field label="Position" value={certificate.position} highlight />
        <Field label="Date of Issue" value={certificate.date} />
      </dl>
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          highlight
            ? "mt-1 text-lg font-semibold tracking-tight text-foreground"
            : "mt-1 text-sm text-foreground"
        }
      >
        {value || "—"}
      </dd>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="animate-shake rounded-2xl border border-destructive/40 bg-card p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-destructive/40 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Please double-check the ID and try again.
      </p>
    </div>
  );
}
