import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UserCheck,
  Settings,
  FileText,
  DollarSign,
  Bell,
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
  const location = useLocation();

  const toggleExpand = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]
    );
  };

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
    // ✅ Admin/Warden Complaints with Submenu
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
    // ✅ Student Complaints
    {
      path: '/student/complaints',
      label: 'My Complaints',
      icon: ClipboardList,
      roles: ['STUDENT'],
    },

    // ✅ Admin/Warden Payments
    {
      path: '/admin/payments',
      label: 'Payments',
      icon: DollarSign,
      roles: ['ADMIN', 'WARDEN'],
    },

    // ✅ Student Payments
    {
      path: '/student/payments',
      label: 'My Payments',
      icon: DollarSign,
      roles: ['STUDENT'],
    },

    // ✅ UPDATED: Announcements with role-based routing
    {
      path: '/admin/announcements',
      label: 'Announcements',
      icon: Bell,
      roles: ['ADMIN', 'WARDEN'],
    },
    {
      path: '/student/announcements',
      label: 'Announcements',
      icon: Bell,
      roles: ['STUDENT'],
    },

    // ✅ Settings
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
      roles: ['ADMIN', 'WARDEN'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const renderNavItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const isActive =
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/');

    if (hasChildren) {
      return (
        <div key={item.path}>
          <button
            onClick={() => toggleExpand(item.path)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            style={{ paddingLeft: `${(depth + 1) * 1}rem` }}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
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
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border overflow-y-auto z-20 ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <nav className="p-4 space-y-2">
        {filteredNavItems.map((item) => renderNavItem(item))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;