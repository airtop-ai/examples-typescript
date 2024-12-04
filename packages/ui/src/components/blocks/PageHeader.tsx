import Markdown from "react-markdown";

export interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex-1 space-y-4 pt-6 pb-6">
      <div className="flex-row items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && <Markdown>{description}</Markdown>}
      </div>
    </div>
  );
}
