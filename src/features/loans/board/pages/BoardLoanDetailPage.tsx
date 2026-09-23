import { Link, useParams } from "react-router-dom";
import { useBoardLoanDetail } from "../hooks/useBoardLoans";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";

export const BoardLoanDetailPage = () => {
  const { loanId = "" } = useParams();
  const { data: loan, isLoading } = useBoardLoanDetail(loanId);
  if (isLoading) return <LoadingState message="Loading loan" />;
  if (!loan) return <main className="p-6">Loan not found.</main>;
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
      <Button asChild variant="ghost">
        <Link to="/board/borrowed">← Borrowed</Link>
      </Button>
      <header>
        <p className="text-sm text-muted-foreground">
          {loan.userName} · {loan.userEmail}
        </p>
        <h1 className="text-2xl font-semibold">
          Expected return {new Date(loan.dueDate).toLocaleDateString()}
        </h1>
      </header>
      <section className="divide-y rounded-xl border">
        {loan.items.map((line) => (
          <div key={line.id} className="flex justify-between gap-4 p-4">
            <span>{line.itemName}</span>
            <span>
              {line.borrowedQuantity - line.returnedQuantity - line.lostQuantity} outstanding
            </span>
          </div>
        ))}
      </section>
    </main>
  );
};
