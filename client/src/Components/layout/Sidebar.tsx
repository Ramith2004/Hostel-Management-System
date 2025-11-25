import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UserCheck,
  Settings,
  FileText,
  DollarSign,
  Calendar,
  Package,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
  children?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const userRole = localStorage.getItem('userRole') || '';
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };

  // Navigation items based on roles
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'WARDEN', 'STUDENT'],
    },
    {
      path: '/students',
      label: 'Add Students',
      icon: Users,
      roles: ['ADMIN', 'WARDEN'],
    },
    {
      path: '/rooms',
      label: 'Rooms',
      icon: BedDouble,
      roles: ['ADMIN', 'WARDEN'],
    },
    {
      path: '/allstudents',
      label: 'All Students',
      icon: UserCheck,
      roles: ['ADMIN', 'WARDEN'],
    },
    // Admin/Warden Complaints with Submenu
    {
      path: '/admin/complaints',
      label: 'Complaints',
      icon: ClipboardList,
      roles: ['ADMIN', 'WARDEN'],
      children: [
        {
          path: '/admin/complaints',
          label: 'All Complaints',
          icon: ClipboardList,
          roles: ['ADMIN', 'WARDEN'],
        },
        {
          path: '/admin/complaints/reports',
          label: 'Reports',
          icon: FileText,
          roles: ['ADMIN', 'WARDEN'],
        },
      ],
    },
    // Student Complaints (no submenu)
    {
      path: '/student/complaints',
      label: 'My Complaints',
      icon: ClipboardList,
      roles: ['STUDENT'],
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: DollarSign,
      roles: ['ADMIN', 'WARDEN', 'STUDENT'],
    },
    {
      path: '/inventory',
      label: 'Inventory',
      icon: Package,
      roles: ['ADMIN', 'WARDEN'],
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: FileText,
      roles: ['ADMIN', 'WARDEN'],
    },
    {
      path: '/events',
      label: 'Events',
      icon: Calendar,
      roles: ['ADMIN', 'WARDEN', 'STUDENT'],
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
      roles: ['ADMIN', 'WARDEN'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);

    if (hasChildren) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleExpand(item.path)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {item.children?.map((child) => renderNavItem(child, depth + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`
        }
        style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
      >
        <Icon size={20} />
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 256 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <nav className="p-4 space-y-2">{filteredNavItems.map((item) => renderNavItem(item))}</nav>
    </motion.aside>
  );
};

export default Sidebar;