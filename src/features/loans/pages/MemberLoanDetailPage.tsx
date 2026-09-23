import { Link, useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { useLoanDetail } from "../hooks/useLoans";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";

export const MemberLoanDetailPage = () => {
  const { loanId = "" } = useParams();
  const { currentPersona } = useSession();
  const { data: loan, isLoading } = useLoanDetail(loanId, currentPersona.id);
  if (isLoading) return <LoadingState message="Loading loan" />;
  if (!loan)
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Loan not found.</p>
        <Button asChild className="mt-4">
          <Link to="/app/activity">Back to activity</Link>
        </Button>
      </main>
    );
  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <Button asChild variant="ghost">
        <Link to="/app/activity">← Activity</Link>
      </Button>
      <header>
        <p className="text-sm text-muted-foreground">Equipment with you</p>
        <h1 className="text-2xl font-semibold">
          Expected return {new Date(loan.dueDate).toLocaleDateString()}
        </h1>
      </header>
      <section className="divide-y rounded-xl border">
        {loan.items.map((line) => (
          <div key={line.id} className="flex justify-between gap-4 p-4">
            <span>{line.itemName}</span>
            <span className="font-medium">
              {line.borrowedQuantity - line.returnedQuantity - line.lostQuantity} with you
            </span>
          </div>
        ))}
      </section>
      <p className="text-sm text-muted-foreground">
        Bring equipment to the logistics desk for physical return inspection.
      </p>
    </main>
  );
};
