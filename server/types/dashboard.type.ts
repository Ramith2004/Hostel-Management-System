export interface DashboardMetrics {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  totalStudents: number;
  activeComplaints: number;
  resolvedComplaints: number;
  pendingPayments: number;
  totalFeeCollected: number;
  totalStudentsThisMonth: number;
}

export interface RoomStatusSummary {
  available: number;
  full: number;
  maintenance: number;
  reserved: number;
}

export interface ComplaintSummary {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
}

export interface FeeSummary {
  totalDue: number;
  totalCollected: number;
  totalDefaulters: number;
  collectionRate: number;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  roomStatus: RoomStatusSummary;
  complaints: ComplaintSummary;
  fees: FeeSummary;
  lastUpdated: string;
}