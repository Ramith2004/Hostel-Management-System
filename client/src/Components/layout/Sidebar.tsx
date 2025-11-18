import React from 'react';
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
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const userRole = localStorage.getItem('userRole') || '';

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
      label: 'Students',
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
      path: '/attendance',
      label: 'Attendance',
      icon: UserCheck,
      roles: ['ADMIN', 'WARDEN', 'STUDENT'],
    },
    {
      path: '/complaints',
      label: 'Complaints',
      icon: ClipboardList,
      roles: ['ADMIN', 'WARDEN', 'STUDENT'],
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
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

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
      <nav className="p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
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
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;