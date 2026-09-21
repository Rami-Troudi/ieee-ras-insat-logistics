import {
  Home,
  Package,
  ClipboardList,
  Clock,
  Heart,
  Inbox,
  FolderGit2,
  Users,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Download,
  User,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const MEMBER_NAV_ITEMS: NavItem[] = [
  { name: "Home", path: "/app", icon: Home },
  { name: "Inventory", path: "/app/inventory", icon: Package },
  { name: "My Requests", path: "/app/requests", icon: ClipboardList },
  { name: "My Loans", path: "/app/loans", icon: Clock },
  { name: "Favorites", path: "/app/favorites", icon: Heart },
];

export const MOBILE_MEMBER_TABS: NavItem[] = [
  { name: "Home", path: "/app", icon: Home },
  { name: "Inventory", path: "/app/inventory", icon: Package },
  { name: "Requests", path: "/app/requests", icon: ClipboardList },
  { name: "Loans", path: "/app/loans", icon: Clock },
  { name: "Profile", path: "/app/profile", icon: User },
];

export const BOARD_NAV_ITEMS: NavItem[] = [
  { name: "Action Center", path: "/board", icon: Inbox },
  { name: "Inventory", path: "/board/inventory", icon: Package },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Loans", path: "/board/loans", icon: Clock },
  { name: "Projects", path: "/board/projects", icon: FolderGit2 },
  { name: "Users", path: "/board/users", icon: Users },
  { name: "Audits", path: "/board/audits", icon: CheckCircle2 },
  { name: "Incidents", path: "/board/incidents", icon: AlertTriangle },
  { name: "Insights", path: "/board/insights", icon: BarChart3 },
  { name: "Exports", path: "/board/exports", icon: Download },
];

export const BOARD_MOBILE_TABS: NavItem[] = [
  { name: "Action", path: "/board", icon: Inbox },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Loans", path: "/board/loans", icon: Clock },
  { name: "Inventory", path: "/board/inventory", icon: Package },
];

export const BOARD_MORE_ITEMS: NavItem[] = [
  { name: "Projects", path: "/board/projects", icon: FolderGit2 },
  { name: "Users & Accounts", path: "/board/users", icon: Users },
  { name: "Audits", path: "/board/audits", icon: CheckCircle2 },
  { name: "Incidents & Strikes", path: "/board/incidents", icon: AlertTriangle },
  { name: "Insights Dashboard", path: "/board/insights", icon: BarChart3 },
  { name: "Data Exports", path: "/board/exports", icon: Download },
  { name: "Operational Notifications", path: "/board/notifications", icon: Bell },
  { name: "Board Profile", path: "/board/profile", icon: User },
];
