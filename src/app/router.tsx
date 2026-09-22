import { createBrowserRouter } from "react-router-dom";
import { MemberLayout } from "@/layouts/MemberLayout";
import { BoardLayout } from "@/layouts/BoardLayout";
import { RootRedirect } from "@/app/RootRedirect";
import {
  MemberHomePage,
  MemberInventoryPage,
  MemberItemDetailPage,
  MemberCartPage,
  MemberRequestsPage,
  MemberRequestDetailPage,
  MemberLoansPage,
  MemberLoanDetailPage,
  MemberFavoritesPage,
  MemberNotificationsPage,
  MemberProfilePage,
} from "@/pages/member";
import {
  BoardActionCenterPage,
  BoardInventoryPage,
  BoardRequestsPage,
  BoardRequestDetailPage,
  BoardLoansPage,
  BoardProjectsPage,
  BoardUsersPage,
  BoardAuditsPage,
  BoardIncidentsPage,
  BoardInsightsPage,
  BoardExportsPage,
  BoardProfilePage,
  BoardNotificationsPage,
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
      { index: true, element: <MemberHomePage /> },
      { path: "inventory", element: <MemberInventoryPage /> },
      { path: "inventory/:itemId", element: <MemberItemDetailPage /> },
      { path: "cart", element: <MemberCartPage /> },
      { path: "requests", element: <MemberRequestsPage /> },
      { path: "requests/:requestId", element: <MemberRequestDetailPage /> },
      { path: "loans", element: <MemberLoansPage /> },
      { path: "loans/:loanId", element: <MemberLoanDetailPage /> },
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
      { path: "requests/:requestId", element: <BoardRequestDetailPage /> },
      { path: "loans", element: <BoardLoansPage /> },
      { path: "inventory", element: <BoardInventoryPage /> },
      { path: "projects", element: <BoardProjectsPage /> },
      { path: "users", element: <BoardUsersPage /> },
      { path: "audits", element: <BoardAuditsPage /> },
      { path: "incidents", element: <BoardIncidentsPage /> },
      { path: "insights", element: <BoardInsightsPage /> },
      { path: "exports", element: <BoardExportsPage /> },
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
