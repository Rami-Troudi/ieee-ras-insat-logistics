import { createBrowserRouter, Navigate } from "react-router-dom";
import { MemberLayout } from "@/layouts/MemberLayout";
import { BoardLayout } from "@/layouts/BoardLayout";
import {
  MemberHomePage,
  MemberInventoryPage,
  MemberRequestsPage,
  MemberLoansPage,
  MemberFavoritesPage,
  MemberNotificationsPage,
  MemberProfilePage,
} from "@/pages/member";
import {
  BoardActionCenterPage,
  BoardInventoryPage,
  BoardRequestsPage,
  BoardLoansPage,
  BoardProjectsPage,
  BoardUsersPage,
  BoardAuditsPage,
  BoardIncidentsPage,
  BoardInsightsPage,
  BoardExportsPage,
} from "@/pages/board";
import { DesignLabPage } from "@/pages/system/DesignLabPage";
import { NotFoundPage } from "@/pages/system/NotFoundPage";
import { useDevPersona } from "@/hooks/useDevPersona";

const RootRedirect: React.FC = () => {
  const { currentPersona } = useDevPersona();
  if (currentPersona.role === "BOARD" || currentPersona.role === "SUPERADMIN") {
    return <Navigate to="/board" replace />;
  }
  return <Navigate to="/app" replace />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/app",
    element: <MemberLayout />,
    children: [
      { index: true, element: <MemberHomePage /> },
      { path: "inventory", element: <MemberInventoryPage /> },
      { path: "requests", element: <MemberRequestsPage /> },
      { path: "loans", element: <MemberLoansPage /> },
      { path: "favorites", element: <MemberFavoritesPage /> },
      { path: "notifications", element: <MemberNotificationsPage /> },
      { path: "profile", element: <MemberProfilePage /> },
    ],
  },
  {
    path: "/board",
    element: <BoardLayout />,
    children: [
      { index: true, element: <BoardActionCenterPage /> },
      { path: "requests", element: <BoardRequestsPage /> },
      { path: "loans", element: <BoardLoansPage /> },
      { path: "inventory", element: <BoardInventoryPage /> },
      { path: "projects", element: <BoardProjectsPage /> },
      { path: "users", element: <BoardUsersPage /> },
      { path: "audits", element: <BoardAuditsPage /> },
      { path: "incidents", element: <BoardIncidentsPage /> },
      { path: "insights", element: <BoardInsightsPage /> },
      { path: "exports", element: <BoardExportsPage /> },
    ],
  },
  {
    path: "/_dev/design",
    element: <DesignLabPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
