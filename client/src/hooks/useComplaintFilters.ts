import { useState, useCallback } from "react";

export interface ComplaintFilters {
  status?: string;
  priority?: string;
  category?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const useComplaintFilters = () => {
  const [filters, setFilters] = useState<ComplaintFilters>({
    page: 1,
    limit: 10,
  });

  const updateFilter = useCallback((key: keyof ComplaintFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
    });
  }, []);

  const updateMultipleFilters = useCallback((newFilters: Partial<ComplaintFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    updateMultipleFilters,
    setPage,
  };
};