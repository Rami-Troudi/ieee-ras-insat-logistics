import { Link, useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { useRequestDetail } from "../hooks/useRequests";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";

export const MemberRequestDetailPage = () => {
  const { requestId = "" } = useParams();
  const { currentPersona } = useSession();
  const { data: request, isLoading } = useRequestDetail(requestId, currentPersona.id);
  if (isLoading) return <LoadingState message="Loading request" />;
  if (!request) return <main className="p-6">Request not found.</main>;
  const status =
    request.handoverStatus === "HANDED_OVER"
      ? "With you"
      : request.decisionStatus === "PENDING"
        ? "Waiting"
        : request.decisionStatus === "REJECTED"
          ? "Declined"
          : request.decisionStatus === "PARTIALLY_APPROVED"
            ? "Partially approved"
            : request.decisionStatus === "APPROVED"
              ? "Ready to pick up"
              : request.status;
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <Button asChild variant="ghost" className="min-h-11">
        <Link to="/app/activity">← Activity</Link>
      </Button>
      <header>
        <p className="text-sm text-muted-foreground">{status}</p>
        <h1 className="text-2xl font-semibold">Equipment request</h1>
        <p className="text-sm text-muted-foreground">
          Expected return {formatDate(request.expectedReturnDate)}
        </p>
      </header>
      <section className="divide-y rounded-xl border">
        {request.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 p-4">
            <span>{item.itemName}</span>
            <span>×{item.approvedQuantity || item.requestedQuantity}</span>
          </div>
        ))}
      </section>
      {request.pickupDeadline && status === "Ready to pick up" && (
        <p className="rounded-lg bg-muted p-3 text-sm">
          Please collect the approved items by {formatDate(request.pickupDeadline)}.
        </p>
      )}
      {request.note && <p className="text-sm">Note: {request.note}</p>}
      {request.decisionNotes && (
        <p className="text-sm text-muted-foreground">Update: {request.decisionNotes}</p>
      )}
      <section className="space-y-3">
        <h2 className="font-semibold">Updates</h2>
        <ol className="space-y-3 border-l pl-4">
          {request.timeline.map((entry, index) => (
            <li key={`${entry.timestamp}-${index}`} className="text-sm">
              <p>{entry.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
};
