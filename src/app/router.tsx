import { createBrowserRouter, Navigate } from "react-router-dom";
import { MemberLayout } from "@/layouts/MemberLayout";
import { BoardLayout } from "@/layouts/BoardLayout";
import { RootRedirect } from "@/app/RootRedirect";
import {
  MemberInventoryPage,
  MemberItemDetailPage,
  MemberCartPage,
  MemberRequestDetailPage,
  MemberLoanDetailPage,
  MemberNotificationsPage,
  MemberProfilePage,
  MemberActivityPage,
} from "@/pages/member";
import {
  BoardActionCenterPage,
  BoardDashboardPage,
  BoardBorrowedPage,
  BoardPeoplePage,
  BoardMorePage,
  BoardInventoryPage,
  BoardItemDetailPage,
  BoardRequestsPage,
  BoardRequestDetailPage,
  BoardLoansPage,
  BoardLoanDetailPage,
  BoardProjectsPage,
  BoardProjectDetailPage,
  BoardUsersPage,
  BoardUserDetailPage,
  BoardAuditsPage,
  BoardAuditDetailPage,
  BoardIncidentsPage,
  BoardIncidentDetailPage,
  BoardInsightsPage,
  BoardExportsPage,
  BoardProfilePage,
  BoardNotificationsPage,
  BoardAuditLogPage,
} from "@/pages/board";
import React from "react";
import { NotFoundPage } from "@/pages/system/NotFoundPage";

const isDev = import.meta.env.DEV;

const DesignLabPage = isDev
  ? React.lazy(() =>
      import("@/pages/system/DesignLabPage").then((m) => ({ default: m.DesignLabPage }))
    )
  : null;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/auth/login",
    async lazy() {
      const { LoginPage } = await import("@/pages/auth/LoginPage");
      return { Component: LoginPage };
    },
  },
  {
    path: "/auth/register",
    async lazy() {
      const { RegisterPage } = await import("@/pages/auth/RegisterPage");
      return { Component: RegisterPage };
    },
  },
  {
    path: "/auth/forgot-password",
    async lazy() {
      const { ForgotPasswordPage } = await import("@/pages/auth/ForgotPasswordPage");
      return { Component: ForgotPasswordPage };
    },
  },
  {
    path: "/app",
    element: <MemberLayout />,
    children: [
      { index: true, element: <MemberInventoryPage /> },
      { path: "inventory", element: <MemberInventoryPage /> },
      { path: "inventory/:itemId", element: <MemberItemDetailPage /> },
      { path: "cart", element: <MemberCartPage /> },
      { path: "activity", element: <MemberActivityPage /> },
      { path: "requests", element: <Navigate to="/app/activity" replace /> },
      { path: "requests/:requestId", element: <MemberRequestDetailPage /> },
      { path: "loans", element: <Navigate to="/app/activity" replace /> },
      { path: "loans/:loanId", element: <MemberLoanDetailPage /> },
      { path: "favorites", element: <Navigate to="/app/inventory" replace /> },
      { path: "notifications", element: <MemberNotificationsPage /> },
      { path: "profile", element: <MemberProfilePage /> },
    ],
  },
  {
    path: "/board",
    element: <BoardLayout />,
    children: [
      { index: true, element: <BoardDashboardPage /> },
      { path: "dashboard", element: <BoardDashboardPage /> },
      { path: "action-center", element: <BoardActionCenterPage /> },
      { path: "requests", element: <BoardRequestsPage /> },
      { path: "requests/:requestId", element: <BoardRequestDetailPage /> },
      { path: "borrowed", element: <BoardBorrowedPage /> },
      { path: "loans", element: <BoardLoansPage /> },
      { path: "loans/:loanId", element: <BoardLoanDetailPage /> },
      { path: "inventory", element: <BoardInventoryPage /> },
      { path: "inventory/:itemId", element: <BoardItemDetailPage /> },
      { path: "people", element: <BoardPeoplePage /> },
      { path: "more", element: <BoardMorePage /> },
      { path: "projects", element: <BoardProjectsPage /> },
      { path: "projects/:projectId", element: <BoardProjectDetailPage /> },
      { path: "users", element: <BoardUsersPage /> },
      { path: "users/:userId", element: <BoardUserDetailPage /> },
      { path: "audits", element: <BoardAuditsPage /> },
      { path: "audits/:auditId", element: <BoardAuditDetailPage /> },
      { path: "incidents", element: <BoardIncidentsPage /> },
      { path: "incidents/:incidentId", element: <BoardIncidentDetailPage /> },
      { path: "insights", element: <BoardInsightsPage /> },
      { path: "exports", element: <BoardExportsPage /> },
      { path: "audit-log", element: <BoardAuditLogPage /> },
      { path: "profile", element: <BoardProfilePage /> },
      { path: "notifications", element: <BoardNotificationsPage /> },
    ],
  },
  ...(isDev && DesignLabPage
    ? [
        {
          path: "/_dev/design",
          element: (
            <React.Suspense fallback={null}>
              <DesignLabPage />
            </React.Suspense>
          ),
        },
      ]
    : []),
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
