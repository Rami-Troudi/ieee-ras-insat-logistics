import { Link } from "react-router-dom";
import { useUserRequests, useCancelRequest } from "@/features/requests/hooks/useRequests";
import { useUserLoans } from "@/features/loans/hooks/useLoans";
import { useSession } from "@/hooks/useSession";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";

export const MemberActivityPage = () => {
  const { currentPersona } = useSession();
  const requestsQuery = useUserRequests(currentPersona.id);
  const loansQuery = useUserLoans(currentPersona.id);
  const cancelRequest = useCancelRequest(currentPersona.id);
  if (requestsQuery.isLoading || loansQuery.isLoading)
    return <LoadingState message="Loading your activity" />;
  const requests = requestsQuery.data ?? [];
  const loans = loansQuery.data ?? [];
  const sections = [
    {
      title: "Waiting",
      requests: requests.filter(
        (request) => request.decisionStatus === "PENDING" && request.lifecycleStatus === "ACTIVE"
      ),
      loans: [],
    },
    {
      title: "Ready to pick up",
      requests: requests.filter(
        (request) =>
          ["APPROVED", "PARTIALLY_APPROVED"].includes(request.decisionStatus) &&
          request.handoverStatus === "WAITING" &&
          request.lifecycleStatus === "ACTIVE"
      ),
      loans: [],
    },
    {
      title: "With you",
      requests: [],
      loans: loans.filter((loan) => loan.lifecycleStatus === "ACTIVE"),
    },
    {
      title: "Past",
      requests: requests.filter(
        (request) =>
          request.lifecycleStatus === "CLOSED" ||
          request.lifecycleStatus === "CANCELLED" ||
          request.lifecycleStatus === "EXPIRED"
      ),
      loans: loans.filter((loan) => loan.lifecycleStatus === "CLOSED"),
    },
  ];
  return (
    <main className="mx-auto max-w-2xl space-y-7 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">Requests and equipment in your care.</p>
        </div>
        <Button asChild className="min-h-11">
          <Link to="/app/inventory">Browse equipment</Link>
        </Button>
      </header>
      {sections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-sm font-semibold">{section.title}</h2>
          {section.requests.length === 0 && section.loans.length === 0 ? (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              Nothing here yet.
            </p>
          ) : (
            <div className="space-y-3">
              {section.requests.map((request) => (
                <article key={request.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {request.decisionStatus === "PENDING"
                          ? "Waiting for review"
                          : request.decisionStatus === "REJECTED"
                            ? "Declined"
                            : "Ready to pick up"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="min-h-11">
                      <Link to={`/app/requests/${request.id}`}>Details</Link>
                    </Button>
                  </div>
                  <ul className="divide-y rounded-lg bg-muted/30 px-3">
                    {request.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                        <span>{item.itemName}</span>
                        <span>
                          ×
                          {request.decisionStatus === "PENDING"
                            ? item.requestedQuantity
                            : item.approvedQuantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {request.pickupDeadline && section.title === "Ready to pick up" && (
                    <p className="text-sm text-muted-foreground">
                      Collect by {formatDate(request.pickupDeadline)}.
                    </p>
                  )}
                  {request.note && (
                    <p className="text-sm text-muted-foreground">Note: {request.note}</p>
                  )}
                  {request.decisionStatus === "PENDING" && (
                    <Button
                      variant="outline"
                      className="min-h-11"
                      disabled={cancelRequest.isPending}
                      onClick={() =>
                        cancelRequest.mutate({
                          requestId: request.id,
                          reason: "Cancelled by member",
                        })
                      }
                    >
                      Cancel request
                    </Button>
                  )}
                </article>
              ))}
              {section.loans.map((loan) => (
                <article key={loan.id} className="space-y-3 rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Expected return {formatDate(loan.dueDate)}</p>
                      <p className="text-sm text-muted-foreground">
                        {loan.dueStatus === "OVERDUE" ? "Overdue" : "Equipment in your care"}
                      </p>
                    </div>
                    <Button asChild variant="outline" className="min-h-11">
                      <Link to={`/app/loans/${loan.id}`}>Details</Link>
                    </Button>
                  </div>
                  <ul className="divide-y rounded-lg bg-muted/30 px-3">
                    {loan.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                        <span>{item.itemName}</span>
                        <span>
                          ×{item.borrowedQuantity - item.returnedQuantity - item.lostQuantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              {section.title === "Past" && (
                <Button asChild variant="outline" className="min-h-11">
                  <Link to="/app/inventory">Request equipment again</Link>
                </Button>
              )}
            </div>
          )}
        </section>
      ))}
    </main>
  );
};
