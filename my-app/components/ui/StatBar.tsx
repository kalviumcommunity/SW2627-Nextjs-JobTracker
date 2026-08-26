import React from "react";

export interface StatBarProps {
  pendingCount: number;
  viewedCount: number;
  rejectedCount: number;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function StatBar({
  pendingCount,
  viewedCount,
  rejectedCount,
  selectedStatus = "all",
  onSelectStatus,
}: StatBarProps) {
  return (
    <div className="bg-white border border-[#c7c4d8] rounded-xl p-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.06)]">
      {/* All Option if onSelectStatus is provided */}
      {onSelectStatus && (
        <>
          <button
            type="button"
            onClick={() => onSelectStatus("all")}
            className={`flex items-center gap-1.5 font-medium transition-colors ${
              selectedStatus === "all"
                ? "text-[#3525cd] font-bold"
                : "text-[#464555] hover:text-[#121c28]"
            }`}
          >
            <span>All ({pendingCount + viewedCount + rejectedCount})</span>
          </button>
          <div className="hidden sm:block text-[#c7c4d8]">•</div>
        </>
      )}

      {/* Pending Stat */}
      <button
        type="button"
        disabled={!onSelectStatus}
        onClick={() => onSelectStatus && onSelectStatus("pending")}
        className={`flex items-center gap-2 font-medium transition-colors ${
          selectedStatus === "pending"
            ? "text-[#3525cd] font-bold"
            : "text-[#121c28] hover:text-[#3525cd]"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd] shrink-0" />
        <span>{pendingCount} Pending</span>
      </button>

      <div className="hidden sm:block text-[#c7c4d8]">•</div>

      {/* Viewed Stat */}
      <button
        type="button"
        disabled={!onSelectStatus}
        onClick={() => onSelectStatus && onSelectStatus("viewed")}
        className={`flex items-center gap-2 font-medium transition-colors ${
          selectedStatus === "viewed"
            ? "text-[#065f46] font-bold"
            : "text-[#121c28] hover:text-[#065f46]"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
        <span>{viewedCount} Viewed</span>
      </button>

      <div className="hidden sm:block text-[#c7c4d8]">•</div>

      {/* Rejected Stat */}
      <button
        type="button"
        disabled={!onSelectStatus}
        onClick={() => onSelectStatus && onSelectStatus("rejected")}
        className={`flex items-center gap-2 font-medium transition-colors ${
          selectedStatus === "rejected"
            ? "text-[#93000a] font-bold"
            : "text-[#121c28] hover:text-[#93000a]"
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
        <span>{rejectedCount} Rejected</span>
      </button>
    </div>
  );
}
