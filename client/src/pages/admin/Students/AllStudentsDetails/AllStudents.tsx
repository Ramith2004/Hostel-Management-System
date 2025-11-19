import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  User,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { fetchAllStudents } from '../../../../lib/student.api';
import DetailInfo from '../../../../Components/Studentdetails/DetailInfo';

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  studentProfile?: {
    guardianName: string;
    guardianPhone: string;
    address: string;
    dateOfBirth: string;
    enrollmentNumber: string;
    course: string;
    year: string;
    emergencyContact: string;
    emergencyContactPhone: string;
    roomNo?: string;
    hostelName?: string;
  };
}

type SortField = 'name' | 'email' | 'roomNo' | 'hostelName' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export default function AllStudents() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.studentProfile?.roomNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentProfile?.hostelName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue: any = '';
    let bValue: any = '';

    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      case 'roomNo':
        aValue = a.studentProfile?.roomNo || '';
        bValue = b.studentProfile?.roomNo || '';
        break;
      case 'hostelName':
        aValue = a.studentProfile?.hostelName || '';
        bValue = b.studentProfile?.hostelName || '';
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStudents = sortedStudents.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Room No', 'Hostel Name', 'Status', 'Joined'];
    const rows = sortedStudents.map((student) => [
      student.name,
      student.email,
      student.phone,
      student.studentProfile?.roomNo || 'N/A',
      student.studentProfile?.hostelName || 'N/A',
      student.status,
      new Date(student.createdAt).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewDetails = (student: StudentData) => {
    setSelectedStudent(student);
    setShowDetailDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDetailDrawer(false);
    setTimeout(() => setSelectedStudent(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Loader className="w-12 h-12" style={{ color: 'var(--primary)' }} />
          </motion.div>
          <p className="text-foreground text-lg font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">All Students</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                {sortedStudents.length} total • {paginatedStudents.length} shown
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportCSV}
              disabled={sortedStudents.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-80 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, phone, room no, or hostel..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-card text-foreground placeholder-muted-foreground focus:outline-none transition-colors"
                style={{
                  borderColor: 'var(--border)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-all"
              style={{
                background: showFilters ? 'var(--primary)' : 'var(--card)',
                color: showFilters ? 'var(--primary-foreground)' : 'var(--foreground)',
                borderColor: showFilters ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <Filter className="w-5 h-5" />
              Filters
            </motion.button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 p-4 rounded-xl border-2"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <span className="font-semibold text-foreground">Status:</span>
                <div className="flex gap-3">
                  {['all', 'ACTIVE', 'INACTIVE'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFilterStatus(status as any);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 rounded-lg font-semibold capitalize transition-all"
                      style={{
                        background: filterStatus === status ? 'var(--primary)' : 'var(--muted)',
                        color:
                          filterStatus === status
                            ? 'var(--primary-foreground)'
                            : 'var(--muted-foreground)',
                      }}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl border-2"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--destructive)',
            }}
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Error loading students</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadStudents}
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{
                    background: 'var(--destructive)',
                    color: 'var(--destructive-foreground)',
                  }}
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {sortedStudents.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-20 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex p-6 rounded-full mb-6"
              style={{ background: 'var(--muted)' }}
            >
              <User className="w-12 h-12 text-muted-foreground" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first student'}
            </p>
          </motion.div>
        )}

        {/* Table */}
        {sortedStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl overflow-hidden border-2 shadow-lg"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--muted)' }}>
                    <TableHeader field="name" label="Name" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <TableHeader field="email" label="Email" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <TableHeader field="roomNo" label="Room No" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <TableHeader field="hostelName" label="Hostel Name" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <TableHeader field="status" label="Status" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <TableHeader field="createdAt" label="Joined" onSort={handleSort} currentSort={{ field: sortField, order: sortOrder }} />
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((student, idx) => (
                    <TableRow
                      key={student.id}
                      student={student}
                      isEven={idx % 2 === 0}
                      onViewDetails={() => handleViewDetails(student)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-6 border-t-2" style={{ borderColor: 'var(--border)' }}>
              <div className="text-sm text-muted-foreground">
                Showing {startIdx + 1} to {Math.min(startIdx + ITEMS_PER_PAGE, sortedStudents.length)} of{' '}
                {sortedStudents.length} results
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: currentPage === 1 ? 'var(--muted)' : 'var(--primary)',
                    color:
                      currentPage === 1 ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  }}
                >
                  Previous
                </motion.button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10 rounded-lg font-semibold transition-all"
                        style={{
                          background:
                            currentPage === pageNum ? 'var(--primary)' : 'var(--muted)',
                          color:
                            currentPage === pageNum
                              ? 'var(--primary-foreground)'
                              : 'var(--muted-foreground)',
                        }}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background:
                      currentPage === totalPages ? 'var(--muted)' : 'var(--primary)',
                    color:
                      currentPage === totalPages
                        ? 'var(--muted-foreground)'
                        : 'var(--primary-foreground)',
                  }}
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Detail Drawer Component */}
      <DetailInfo
        student={selectedStudent}
        isOpen={showDetailDrawer}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

// Table Header Component
interface TableHeaderProps {
  field: SortField;
  label: string;
  onSort: (field: SortField) => void;
  currentSort: { field: SortField; order: SortOrder };
}

function TableHeader({ field, label, onSort, currentSort }: TableHeaderProps) {
  const isActive = currentSort.field === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-border/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        <motion.div
          animate={{ rotate: isActive && currentSort.order === 'desc' ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isActive ? (
            currentSort.order === 'asc' ? (
              <ChevronUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            )
          ) : (
            <ArrowUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
          )}
        </motion.div>
      </div>
    </th>
  );
}

// Table Row Component
interface TableRowProps {
  student: StudentData;
  isEven: boolean;
  onViewDetails: () => void;
}

function TableRow({ student, isEven, onViewDetails }: TableRowProps) {
  const statusColor = student.status === 'ACTIVE' ? 'var(--chart-1)' : 'var(--muted-foreground)';
  const profile = student.studentProfile;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{
        background: 'var(--muted)',
      }}
      style={{
        background: isEven ? 'transparent' : 'var(--muted)',
      }}
      className="border-b-2 transition-all"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
              color: 'var(--primary-foreground)',
            }}
          >
            {student.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <span className="font-semibold text-foreground">{student.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">{student.email}</td>
      <td className="px-6 py-4 text-sm text-foreground font-mono">
        {profile?.roomNo || 'N/A'}
      </td>
      <td className="px-6 py-4 text-sm text-foreground">{profile?.hostelName || 'N/A'}</td>
      <td className="px-6 py-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: `${statusColor}20`, color: statusColor }}
        >
          {student.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground">
        {new Date(student.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewDetails}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          <Eye className="w-4 h-4" />
          View
        </motion.button>
      </td>
    </motion.tr>
  );
}