import React from "react";

export function JobCardSkeleton() {
  return (
    <div className="bg-white border border-[#c7c4d8] rounded-xl p-5 flex flex-col animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#dfe9fa]" />
        <div className="w-14 h-5 rounded-full bg-[#dfe9fa]" />
      </div>
      <div className="w-3/4 h-5 rounded bg-[#dfe9fa] mb-2" />
      <div className="w-1/2 h-4 rounded bg-[#dfe9fa] mb-4" />
      <div className="flex gap-2 mb-6">
        <div className="w-14 h-5 rounded bg-[#dfe9fa]" />
        <div className="w-16 h-5 rounded bg-[#dfe9fa]" />
        <div className="w-12 h-5 rounded bg-[#dfe9fa]" />
      </div>
      <div className="mt-auto pt-3 border-t border-[#c7c4d8]/40 flex justify-between items-center">
        <div className="w-20 h-4 rounded bg-[#dfe9fa]" />
        <div className="w-16 h-8 rounded-lg bg-[#dfe9fa]" />
      </div>
    </div>
  );
}

export function JobGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}
