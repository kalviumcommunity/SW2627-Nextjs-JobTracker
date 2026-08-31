"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { JobCard, JobData } from "@/components/ui/JobCard";
import { JobGridSkeleton } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";

const JOBS_PER_PAGE = 6;

export default function CandidateJobs() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch jobs and candidate applications
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      // 1. Fetch all jobs
      const jobsRes = await fetch("/api/jobs");
      if (!jobsRes.ok) {
        throw new Error("Failed to load job listings.");
      }
      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs || []);

      // 2. Fetch candidate's applications if logged in
      try {
        const appsRes = await fetch("/api/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const ids = new Set<string>(
            (appsData.applications || []).map((app: { jobId: string }) => app.jobId)
          );
          setAppliedJobIds(ids);
        }
      } catch {
        // Silently continue if user is not logged in as candidate
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const jobsRes = await fetch("/api/jobs");
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (!ignore) setJobs(jobsData.jobs || []);
        } else {
          if (!ignore) setError("Failed to load job listings.");
        }

        const appsRes = await fetch("/api/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const ids = new Set<string>(
            (appsData.applications || []).map((app: { jobId: string }) => app.jobId)
          );
          if (!ignore) setAppliedJobIds(ids);
        }
      } catch {
        if (!ignore) setError("Unable to connect to the server. Please try again.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle direct apply
  async function handleApply(jobId: string) {
    setApplyingJobId(jobId);
    setFeedback(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setFeedback({
            type: "error",
            message: "Please sign in as a candidate to apply for jobs.",
          });
        } else {
          setFeedback({
            type: "error",
            message: data.error || "Failed to submit application.",
          });
        }
        return;
      }

      // Add to applied set
      setAppliedJobIds((prev) => new Set([...prev, jobId]));
      setFeedback({
        type: "success",
        message: "Application submitted successfully! Track your status in My Applications.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Network error occurred while applying. Please try again.",
      });
    } finally {
      setApplyingJobId(null);
    }
  }

  // Filtered jobs with accurate search & location matching
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const titleLower = job.title.toLowerCase();
      const employerLower = (job.employer?.name || "").toLowerCase();
      const locationLower = (job.location || "").toLowerCase();
      const queryLower = searchTerm.toLowerCase().trim();

      // Search match across title, employer name, and location
      const matchesSearch =
        !queryLower ||
        titleLower.includes(queryLower) ||
        employerLower.includes(queryLower) ||
        locationLower.includes(queryLower);

      // Location match
      let matchesLocation = true;
      if (selectedLocation !== "All") {
        const filterLoc = selectedLocation.toLowerCase();
        if (filterLoc === "on-site") {
          matchesLocation =
            locationLower.includes("on-site") ||
            locationLower.includes("onsite") ||
            titleLower.includes("on-site") ||
            titleLower.includes("onsite");
        } else {
          matchesLocation =
            locationLower.includes(filterLoc) || titleLower.includes(filterLoc);
        }
      }

      // Role Type match
      let matchesType = true;
      if (selectedType !== "All") {
        matchesType = titleLower.includes(selectedType.toLowerCase());
      }

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [jobs, searchTerm, selectedLocation, selectedType]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleLocationChange = (val: string) => {
    setSelectedLocation(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (val: string) => {
    setSelectedType(val);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(start, start + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLocation("All");
    setSelectedType("All");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || selectedLocation !== "All" || selectedType !== "All";

  return (
    <AppShell role="candidate">
      <div className="space-y-6">
        {/* Feedback Alert Toast */}
        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-[#ffdad6]/60 border border-[#ba1a1a]/20 text-[#93000a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-[#ba1a1a] text-white text-xs font-semibold rounded-lg hover:bg-[#93000a] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Area (Matching Stitch job_listings_candidate) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121c28]">
                {isLoading ? "Finding jobs..." : `${filteredJobs.length} jobs available`}
              </h1>
              <p className="text-xs sm:text-sm text-[#464555] mt-0.5">
                Explore open positions from verified employers
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80 md:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777587] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search jobs, skills, location, or company"
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#c7c4d8] rounded-lg text-xs sm:text-sm text-[#121c28] placeholder:text-[#9CA3AF] focus:ring-4 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#121c28] p-0.5"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Location Filter */}
            <div className="relative inline-block">
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="appearance-none px-3 py-1.5 pr-7 bg-white border border-[#c7c4d8] rounded-full text-xs font-medium text-[#121c28] hover:bg-[#f8f9ff] cursor-pointer focus:ring-2 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-colors"
              >
                <option value="All">All Locations</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Delhi">Delhi</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#777587] pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Job Type Filter */}
            <div className="relative inline-block">
              <select
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="appearance-none px-3 py-1.5 pr-7 bg-white border border-[#c7c4d8] rounded-full text-xs font-medium text-[#121c28] hover:bg-[#f8f9ff] cursor-pointer focus:ring-2 focus:ring-[#3525cd]/10 focus:border-[#3525cd] outline-none transition-colors"
              >
                <option value="All">All Roles</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Engineer">Engineer</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#777587] pointer-events-none">
                arrow_drop_down
              </span>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#3525cd] hover:bg-[#e5eeff] transition-colors inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={fetchData}
              className="ml-auto px-2.5 py-1 text-xs text-[#575e70] hover:text-[#121c28] hover:bg-[#f1f5f9] rounded-lg transition-colors flex items-center gap-1"
              title="Refresh listings"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Refresh
            </button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <JobGridSkeleton count={6} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            icon="work_off"
            title={hasActiveFilters ? "No matching jobs found" : "No jobs posted yet"}
            description={
              hasActiveFilters
                ? "Try adjusting your search query or clear filters to see more listings."
                : "Check back soon! Employers will be posting new job openings shortly."
            }
            actionLabel={hasActiveFilters ? "Clear All Filters" : "Refresh Listings"}
            onAction={hasActiveFilters ? clearFilters : fetchData}
          />
        ) : (
          <>
            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isApplied={appliedJobIds.has(job.id)}
                  isApplying={applyingJobId === job.id}
                  onApply={handleApply}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1.5 pt-4 pb-6">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c7c4d8] text-[#464555] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_left
                  </span>
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                        isCurrent
                          ? "bg-[#3525cd] text-white shadow-2xs"
                          : "border border-[#c7c4d8] text-[#464555] hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-md border border-[#c7c4d8] text-[#464555] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    chevron_right
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}