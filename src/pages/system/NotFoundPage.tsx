import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/shared/PageContainer";
import { HelpCircle, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The operational route you requested does not exist or has moved.
          </p>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <Button asChild variant="default" size="default">
            <Link to="/app" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Member Portal</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="default">
            <Link to="/board">Board Console</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
