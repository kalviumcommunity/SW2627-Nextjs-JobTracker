"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ApplicationCard, ApplicationData } from "@/components/ui/ApplicationCard";
import { StatBar } from "@/components/ui/StatBar";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchApplications = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError("");

    try {
      const response = await fetch("/api/applications");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in as a candidate to view your applications.");
        }
        throw new Error("Failed to load applications.");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) {
          if (response.status === 401) {
            if (!ignore) setError("Please log in as a candidate to view your applications.");
            return;
          }
          if (!ignore) setError("Failed to load applications.");
          return;
        }
        const data = await response.json();
        if (!ignore) setApplications(data.applications || []);
      } catch {
        if (!ignore) setError("Unable to connect to the server. Please try again.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();

    // Auto-polling every 15 seconds to catch employer status updates
    const interval = setInterval(() => {
      load();
    }, 15000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Compute status counts
  const { pendingCount, viewedCount, rejectedCount } = useMemo(() => {
    let pending = 0;
    let viewed = 0;
    let rejected = 0;

    applications.forEach((app) => {
      const s = (app.status || "").toLowerCase();
      if (s === "viewed" || s === "reviewing" || s === "interviewed") {
        viewed++;
      } else if (s === "rejected" || s === "not selected") {
        rejected++;
      } else {
        pending++;
      }
    });

    return { pendingCount: pending, viewedCount: viewed, rejectedCount: rejected };
  }, [applications]);

  // Filter applications by search and status
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const titleMatch = (app.job?.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const employerMatch = (app.job?.employer?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSearch = !searchQuery || titleMatch || employerMatch;

      let matchesStatus = true;
      if (statusFilter !== "all") {
        const s = (app.status || "").toLowerCase();
        if (statusFilter === "pending") {
          matchesStatus = s === "pending" || s === "pending review";
        } else if (statusFilter === "viewed") {
          matchesStatus = s === "viewed" || s === "reviewing" || s === "interviewed";
        } else if (statusFilter === "rejected") {
          matchesStatus = s === "rejected" || s === "not selected";
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  return (
    <AppShell role="candidate">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header & Stats (Matching Stitch my_applications_candidate) */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
                My Applications
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                Track status updates from employers in real time.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => fetchApplications(true)}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg border border-[#c7c4d8] bg-white text-xs font-medium text-[#121c28] hover:bg-[#f8f9ff] hover:border-[#777587] transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-60"
              >
                <span
                  className={`material-symbols-outlined text-[16px] text-[#3525cd] ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  sync
                </span>
                {isRefreshing ? "Refreshing..." : "Refresh Status"}
              </button>

              <Link
                href="/candidate/jobs"
                className="px-3.5 py-1.5 rounded-lg bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors shadow-2xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Find More Jobs
              </Link>
            </div>
          </div>

          {/* Slim Stat Bar */}
          <StatBar
            pendingCount={pendingCount}
            viewedCount={viewedCount}
            rejectedCount={rejectedCount}
            selectedStatus={statusFilter}
            onSelectStatus={setStatusFilter}
          />
        </div>

        {/* Search Filter Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications by role or company..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#c7c4d8] rounded-lg text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#121c28] p-0.5"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-[#464555] bg-[#e5eeff]/50 px-3 py-1.5 rounded-lg border border-[#3525cd]/20">
            <span>
              Filtering by:{" "}
              {statusFilter !== "all" && <strong className="capitalize text-[#3525cd]">{statusFilter} </strong>}
              {searchQuery && <span>&ldquo;{searchQuery}&rdquo;</span>}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[#3525cd] font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 text-[#93000a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={() => fetchApplications(false)}
              className="px-3 py-1 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#c7c4d8] rounded-xl p-5 animate-pulse flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-[#dfe9fa]" />
                  <div className="space-y-2">
                    <div className="w-48 h-5 rounded bg-[#dfe9fa]" />
                    <div className="w-32 h-3.5 rounded bg-[#dfe9fa]" />
                  </div>
                </div>
                <div className="w-24 h-6 rounded-full bg-[#dfe9fa]" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon="fact_check"
            title="No Applications Submitted Yet"
            description="You haven't submitted any job applications. Browse our curated listings and apply to positions matching your skills."
            actionLabel="Browse Available Jobs"
            actionHref="/candidate/jobs"
          />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon="filter_alt_off"
            title="No Matching Applications"
            description="No applications match your active search query or status filter."
            actionLabel="Clear Filter"
            onAction={clearFilters}
          />
        ) : (
          /* Vertical Stack of Application Cards (Matching Stitch my_applications_candidate) */
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}