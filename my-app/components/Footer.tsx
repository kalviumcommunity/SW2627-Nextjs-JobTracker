import { FEEDBACK_FORM_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer style={{ padding: "1rem", borderTop: "1px solid #e5e7eb", textAlign: "center" }} className="bg-white">
      <p className="text-xs text-[#575e70]">© 2026 Our Product • Apna Tracker</p>
      <div style={{ marginTop: "0.25rem" }}>
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-[#3525cd] hover:underline"
        >
          Peer Review & Feedback Form ↗
        </a>
      </div>
    </footer>
  );
}
