export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'Home',
    href: '/home',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    children: [
      { id: 'project', label: 'Project', icon: 'Menu', href: '/dashboard/project' },
      { id: 'control-room', label: 'Project Control Room', icon: 'Grid3x3', href: '/dashboard/control-room' },
      { id: 'my-view', label: 'My View', icon: 'User', href: '/dashboard/my-view' },
      { id: 'performance', label: 'Performance', icon: 'TrendingUp', href: '/dashboard/performance' },
      { id: 'effectiveness', label: 'Effectiveness', icon: 'BarChart3', href: '/dashboard/effectiveness' },
      {
        id: 'financial',
        label: 'Financial',
        icon: 'Landmark',
        children: [
          { id: 'fin-overview', label: 'Overview', icon: 'LineChart', href: '/dashboard/financial' },
          { id: 'fin-inflow', label: 'Inflow', icon: 'ArrowDownLeft', href: '/dashboard/financial/inflow' },
          { id: 'fin-outflow', label: 'Outflow', icon: 'ArrowUpRight', href: '/dashboard/financial/outflow' },
        ],
      },
      { id: 'resource', label: 'Resource', icon: 'Users', href: '/dashboard/resource' },
      { id: 'material', label: 'Material', icon: 'HardHat', href: '/dashboard/material' },
      { id: 'orders', label: 'Orders', icon: 'Truck', href: '/orders' },
      { id: 'custom', label: 'Custom', icon: 'CircleDot', href: '/dashboard/custom' },
      { id: 'metrics', label: 'Metrics', icon: 'Gauge', href: '/dashboard/metrics' },
    ],
  },
  {
    id: 'ccpm-engine',
    label: 'CCPM Engine',
    icon: 'TrendingUp',
    children: [
      { id: 'plan-detailing', label: 'PERT Board', icon: 'Grid3x3', href: '/planning/plan-detailing' },
      { id: 'monthly-targets', label: 'Monthly Targets', icon: 'ListChecks', href: '/projects/1/monthly-targets' },
      { id: 'resource-map', label: 'Resource Map', icon: 'Building', href: '/projects/1/resource-map' },
      { id: 'kpi-velocity', label: 'Velocity KPIs', icon: 'Gauge', href: '/projects/1/kpi' },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Procurement',
    icon: 'Truck',
    children: [
      { id: 'equipment', label: 'Equipment BOM', icon: 'HardHat', href: '/projects/1/equipment' },
      { id: 'orders', label: 'Orders & Dispatch', icon: 'LineChart', href: '/orders' },
      { id: 'slot-mgmt', label: 'Slot Management', icon: 'CalendarDays', href: '/logistics/slot-management' },
      { id: 'payments', label: 'Vendor Payments', icon: 'Landmark', href: '/payments' },
    ],
  },
  {
    id: 'execution',
    label: 'Execution',
    icon: 'CheckSquare',
    children: [
      { id: 'full-kit', label: 'Full Kit Val', icon: 'Briefcase', href: '/task-management/full-kit' },
      { id: 'red-flags', label: 'Red Flags', icon: 'Siren', href: '/red-flags' },
    ],
  },
  {
    id: 'issue-mgmt',
    label: 'Issue Mgmt.',
    icon: 'AlertTriangle',
    children: [
      { id: 'issues', label: 'Issues', icon: 'AlertCircle', href: '/issue-management' },
      { id: 'action-items', label: 'Action Items', icon: 'ListTodo', href: '/issue-management/action-items' },
      { id: 'red-flags', label: 'Red Flags', icon: 'Siren', href: '/red-flags' },
    ],
  },
  {
    id: 'file-mgmt',
    label: 'File Mgmt.',
    icon: 'FolderOpen',
    children: [
      { id: 'global-list', label: 'Global List', icon: 'File', href: '/file-management/global-list' },
      { id: 'folder-view', label: 'Folder View', icon: 'FolderTree', href: '/file-management/folder-view' },
      { id: 'transmittal', label: 'Transmittal', icon: 'Send', href: '/file-management/transmittal' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: 'UserCog',
    children: [
      { id: 'manage-division', label: 'Manage Division', icon: 'Building', href: '/admin/manage-division' },
      { id: 'manage-user', label: 'Manage User', icon: 'UserPlus', href: '/admin/manage-user' },
      { id: 'modify-config', label: 'Modify Config', icon: 'Settings', href: '/admin/modify-config' },
    ],
  },
];
