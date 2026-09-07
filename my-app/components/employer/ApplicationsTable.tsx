"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { normalizeStatus } from "@/lib/status";

export interface EmployerApplication {
  id: string;
  status: "pending" | "viewed" | "rejected" | string;
  candidateId: string;
  jobId: string;
  coverLetter?: string | null;
  resumeFileName?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  job?: {
    id: string;
    title: string;
    employer?: {
      id: string;
      name: string;
    };
  };
}

export interface ApplicationsTableProps {
  applications: EmployerApplication[];
  isLoading: boolean;
  error?: string;
  onRefresh: () => void;
  jobTitle?: string;
}

export function ApplicationsTable({
  applications,
  isLoading,
  error,
  onRefresh,
  jobTitle,
}: ApplicationsTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const candidateName = (app.candidate?.name || "").toLowerCase();
      const candidateEmail = (app.candidate?.email || "").toLowerCase();
      const roleTitle = (app.job?.title || "").toLowerCase();

      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || candidateName.includes(q) || candidateEmail.includes(q) || roleTitle.includes(q);

      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = normalizeStatus(app.status) === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Compute allowed transitions for selected items:
  // State machine:
  // pending -> viewed, rejected
  // viewed -> rejected
  // rejected -> terminal (cannot be transitioned)
  const eligibleForViewed = useMemo(() => {
    return Array.from(selectedIds).filter((id) => {
      const app = applications.find((a) => a.id === id);
      return app && (app.status || "").toLowerCase() === "pending";
    });
  }, [selectedIds, applications]);

  const eligibleForRejected = useMemo(() => {
    return Array.from(selectedIds).filter((id) => {
      const app = applications.find((a) => a.id === id);
      const s = (app?.status || "").toLowerCase();
      return s === "pending" || s === "viewed";
    });
  }, [selectedIds, applications]);

  // Select all / Deselect all
  const isAllSelected = filteredApplications.length > 0 && filteredApplications.every((app) => selectedIds.has(app.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(filteredApplications.map((app) => app.id));
      setSelectedIds(allIds);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Perform Batch Status Update
  async function handleBatchUpdate(targetStatus: "viewed" | "rejected") {
    const idsToUpdate = targetStatus === "viewed" ? eligibleForViewed : eligibleForRejected;

    if (idsToUpdate.length === 0) {
      setFeedback({
        type: "error",
        message: `None of the selected applications can transition to "${targetStatus}".`,
      });
      return;
    }

    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/applications/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: idsToUpdate,
          status: targetStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update applications.");
      }

      setFeedback({
        type: "success",
        message: `Successfully updated ${data.count || idsToUpdate.length} application(s) to ${
          targetStatus === "viewed" ? "Viewed" : "Rejected"
        }.`,
      });

      setSelectedIds(new Set());
      onRefresh();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Error performing batch update.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  // Individual row status update
  async function handleSingleUpdate(appId: string, newStatus: "viewed" | "rejected") {
    setIsUpdating(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/applications/batch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: [appId],
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setFeedback({
        type: "success",
        message: `Application marked as ${newStatus === "viewed" ? "Viewed" : "Rejected"}.`,
      });
      onRefresh();
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Update failed.",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 text-[#93000a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c7c4d8]">
        <div>
          <h2 className="text-lg font-bold text-[#121c28]">
            {jobTitle ? `Applicants for: ${jobTitle}` : "Applicant Pipeline"}
          </h2>
          <p className="text-xs text-[#464555] mt-0.5">
            {filteredApplications.length} total applicant(s)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or role..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#c7c4d8] bg-white text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/10 outline-none transition-colors"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-3 py-1.5 pr-7 bg-[#f8f9ff] border border-[#c7c4d8] rounded-lg text-xs font-medium text-[#121c28] hover:bg-white cursor-pointer focus:ring-2 focus:ring-[#3525cd]/10 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="viewed">Viewed</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#777587] pointer-events-none">
              arrow_drop_down
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 border border-[#c7c4d8] rounded-lg hover:bg-[#f8f9ff] text-[#464555] hover:text-[#121c28] transition-colors"
            title="Refresh applications"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#c7c4d8] rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-[#f8f9ff] border-b border-[#c7c4d8] sticky top-0 z-10 text-xs font-semibold text-[#575e70]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-[#c7c4d8] text-[#3525cd] focus:ring-[#3525cd] cursor-pointer"
                    aria-label="Select all applications"
                  />
                </th>
                <th className="py-3 px-4 uppercase tracking-wider">Candidate</th>
                <th className="py-3 px-4 uppercase tracking-wider">Applied Role</th>
                <th className="py-3 px-4 uppercase tracking-wider">Date Applied</th>
                <th className="py-3 px-4 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c7c4d8]/40 text-xs sm:text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-[#dfe9fa] rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#dfe9fa]" />
                        <div className="space-y-1.5">
                          <div className="w-28 h-4 bg-[#dfe9fa] rounded" />
                          <div className="w-36 h-3 bg-[#dfe9fa] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32 h-4 bg-[#dfe9fa] rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-[#dfe9fa] rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-6 bg-[#dfe9fa] rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-16 h-4 bg-[#dfe9fa] rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <EmptyState
                      icon="person_search"
                      title={applications.length === 0 ? "No applications received yet" : "No matching applicants"}
                      description={
                        applications.length === 0
                          ? "When candidates apply to your job postings, they will appear in this table."
                          : "Try adjusting your search query or status filter."
                      }
                      actionLabel={applications.length > 0 ? "Reset Filters" : undefined}
                      onAction={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const isSelected = selectedIds.has(app.id);
                  const candidateName = app.candidate?.name || "Candidate";
                  const candidateEmail = app.candidate?.email || "No email provided";
                  const initial = candidateName.charAt(0).toUpperCase() || "C";
                  const roleTitle = app.job?.title || "Role";
                  const dateApplied = app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const canonical = normalizeStatus(app.status);
                  const isPending = canonical === "pending";
                  const isViewed = canonical === "viewed";
                  const isRejected = canonical === "rejected";

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-[#f8f9ff] transition-colors group ${
                        isSelected ? "bg-[#3525cd]/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(app.id)}
                          className="rounded border-[#c7c4d8] text-[#3525cd] focus:ring-[#3525cd] cursor-pointer"
                          aria-label={`Select ${candidateName}`}
                        />
                      </td>

                      {/* Candidate Avatar + Name + Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#dfe9fa] text-[#3525cd] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <Link
                              href={`/employer/applications/${app.id}`}
                              className="font-semibold text-[#121c28] group-hover:text-[#3525cd] transition-colors"
                            >
                              {candidateName}
                            </Link>
                            <p className="text-[12px] text-[#464555]">{candidateEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Applied Role */}
                      <td className="py-3.5 px-4 text-[#121c28] font-medium">
                        {roleTitle}
                      </td>

                      {/* Date Applied */}
                      <td className="py-3.5 px-4 text-[#464555] whitespace-nowrap">
                        {dateApplied}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Actions with State Machine Enforced */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* State Machine Transition 1: pending -> viewed */}
                          {isPending && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleSingleUpdate(app.id, "viewed")}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#d1fae5] text-[#065f46] hover:bg-[#a7f3d0] border border-[#065f46]/20 transition-colors"
                              title="Mark as Viewed"
                            >
                              Mark Viewed
                            </button>
                          )}

                          {/* State Machine Transition 2 & 3: pending -> rejected or viewed -> rejected */}
                          {(isPending || isViewed) && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleSingleUpdate(app.id, "rejected")}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#ffdad6] text-[#93000a] hover:bg-[#fecaca] border border-[#ba1a1a]/20 transition-colors"
                              title="Reject Application"
                            >
                              Reject
                            </button>
                          )}

                          {/* Terminal State (Rejected) */}
                          {isRejected && (
                            <span className="text-[11px] text-[#777587] italic px-2 py-1">
                              Terminal
                            </span>
                          )}

                          {/* Detail Link */}
                          <Link
                            href={`/employer/applications/${app.id}`}
                            className="p-1 text-[#777587] hover:text-[#3525cd] transition-colors rounded hover:bg-[#f1f5f9]"
                            title="View Full Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              chevron_right
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Pill (Matching Stitch #bulk-action-bar) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce-in">
          <div className="bg-[#27313e] text-[#eaf1ff] px-5 py-3 rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.2)] flex items-center gap-3.5 border border-white/10 text-xs sm:text-sm">
            {/* Selected Count */}
            <span className="bg-[#4f46e5]/30 text-[#c3c0ff] font-semibold px-2.5 py-1 rounded-full border border-[#4f46e5]/40">
              {selectedIds.size} selected
            </span>

            <div className="w-px h-4 bg-white/20" />

            {/* Batch Action: Mark as Viewed */}
            <button
              type="button"
              disabled={isUpdating || eligibleForViewed.length === 0}
              onClick={() => handleBatchUpdate("viewed")}
              className="font-medium hover:text-[#c3c0ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              title={
                eligibleForViewed.length === 0
                  ? "No selected applications can transition to Viewed"
                  : `Mark ${eligibleForViewed.length} application(s) as Viewed`
              }
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Mark as Viewed ({eligibleForViewed.length})
            </button>

            {/* Batch Action: Reject */}
            <button
              type="button"
              disabled={isUpdating || eligibleForRejected.length === 0}
              onClick={() => handleBatchUpdate("rejected")}
              className="font-medium hover:text-[#ffdad6] text-[#ffdad6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              title={
                eligibleForRejected.length === 0
                  ? "No selected applications can transition to Rejected"
                  : `Reject ${eligibleForRejected.length} application(s)`
              }
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              Reject ({eligibleForRejected.length})
            </button>

            {/* Deselect / Close */}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 ml-1"
              aria-label="Clear selection"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
