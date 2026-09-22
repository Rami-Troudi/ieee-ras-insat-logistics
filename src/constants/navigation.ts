import {
  Package,
  Activity,
  ShoppingBag,
  LayoutDashboard,
  ClipboardList,
  Clock,
  Users,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

// Simplified borrower navigation
export const MEMBER_NAV_ITEMS: NavItem[] = [
  { name: "Catalogue", path: "/app/inventory", icon: Package },
  { name: "Activity", path: "/app/activity", icon: Activity },
];

export const MOBILE_MEMBER_TABS: NavItem[] = [
  { name: "Catalogue", path: "/app/inventory", icon: Package },
  { name: "Cart", path: "/app/cart", icon: ShoppingBag },
  { name: "Activity", path: "/app/activity", icon: Activity },
];

// Simplified Board navigation
export const BOARD_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", path: "/board", icon: LayoutDashboard },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Borrowed", path: "/board/borrowed", icon: Clock },
  { name: "Inventory", path: "/board/inventory", icon: Package },
  { name: "People", path: "/board/people", icon: Users },
  { name: "More", path: "/board/more", icon: MoreHorizontal },
];

export const BOARD_MOBILE_TABS: NavItem[] = [
  { name: "Dashboard", path: "/board", icon: LayoutDashboard },
  { name: "Requests", path: "/board/requests", icon: ClipboardList },
  { name: "Borrowed", path: "/board/borrowed", icon: Clock },
  { name: "Inventory", path: "/board/inventory", icon: Package },
];

export const BOARD_MORE_ITEMS: NavItem[] = [
  { name: "More Overview", path: "/board/more", icon: MoreHorizontal },
  { name: "People", path: "/board/people", icon: Users },
  { name: "Projects", path: "/board/projects", icon: MoreHorizontal },
  { name: "Insights", path: "/board/insights", icon: MoreHorizontal },
  { name: "Inventory Audits", path: "/board/audits", icon: MoreHorizontal },
  { name: "Exports", path: "/board/exports", icon: MoreHorizontal },
  { name: "Incidents", path: "/board/incidents", icon: MoreHorizontal },
  { name: "Audit Log", path: "/board/audit-log", icon: MoreHorizontal },
];
