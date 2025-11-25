

import { useState, useEffect, useCallback } from "react";
import { studentComplaintAPI, adminComplaintAPI } from "../lib/complaint.api";
import type { ComplaintFilters } from "./useComplaintFilters";

export const useComplaints = (
  tenantId: string,
  userRole: "STUDENT" | "ADMIN" | "WARDEN",
  filters: ComplaintFilters
) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: filters.page || 1,
    limit: filters.limit || 10,
    total: 0,
    pages: 0,
  });

  const fetchComplaints = useCallback(async () => {
    if (!tenantId) {
      setError("Tenant ID is required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("useComplaints: Fetching with filters:", filters);

      let response;
      if (userRole === "STUDENT") {
        // FIX: Pass filters to the API call
        response = await studentComplaintAPI.getMyComplaints(
          tenantId,
          filters
        );
      } else {
        response = await adminComplaintAPI.getComplaints(tenantId, filters);
      }

      console.log("useComplaints: API Response:", response);

      const data = response.data || [];
      const paginationData = response.pagination || {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total: Array.isArray(data) ? data.length : 0,
        pages: Math.ceil((Array.isArray(data) ? data.length : 0) / (filters.limit || 10)),
      };

      setComplaints(Array.isArray(data) ? data : []);
      setPagination(paginationData);
    } catch (err: any) {
      console.error("useComplaints: Error fetching complaints:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch complaints");
      setComplaints([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, userRole, JSON.stringify(filters)]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    loading,
    error,
    pagination,
    fetchComplaints,
    refetch: fetchComplaints,
  };
};