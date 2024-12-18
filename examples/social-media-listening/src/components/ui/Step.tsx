import { cn } from "@local/ui";
import { Check, Loader2 } from "lucide-react";

type StepProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isDone?: boolean;
};

export function Step({ title, description, children, isLoading, isDone }: StepProps) {
  const headerClass = isLoading ? "text-lg font-medium" : "text-md font-normal";
  return (
    <div className="flex flex-col gap-2 border-b pb-4">
      <h3 className={cn("inline-flex items-center gap-2", headerClass)}>
        {isLoading && <Loader2 className="animate-spin" />}
        {isDone && <Check />}
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
