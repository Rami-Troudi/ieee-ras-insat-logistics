import React from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

interface PlaceholderScaffoldProps {
  title: string;
  description: string;
  domainStage?: string;
  children?: React.ReactNode;
}

export const PlaceholderScaffold: React.FC<PlaceholderScaffoldProps> = ({
  title,
  description,
  domainStage = "Stage 2 Workflow",
  children,
}) => {
  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        action={
          <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-muted/60 text-muted-foreground">
            <Layers className="w-3.5 h-3.5" />
            <span>Scheduled for {domainStage}</span>
          </Badge>
        }
      />

      <div className="p-6 border border-dashed border-border rounded-xl bg-card/60 flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          RAS
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{title} Structural Route</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The shell, typography, breadcrumbs, responsive container, and role-based permissions are active.
            The business logic will be composed into this view in {domainStage}.
          </p>
        </div>
        {children}
      </div>
    </PageContainer>
  );
};
