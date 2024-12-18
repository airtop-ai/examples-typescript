import type { AppState } from "@/store";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@local/ui";
import { ArrowUpRightSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function PostList({ posts, showOpen }: { posts: AppState["extractedPosts"]; showOpen?: boolean }) {
  const CollapsableContainer = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(showOpen ?? true);
    const btnIcon = isOpen ? <ChevronUp /> : <ChevronDown />;
    const btnText = isOpen ? "Hide List" : "Show List";
    return (
      <div className="container flex flex-col gap-2 max-h-[700px] overflow-y-auto">
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          {btnIcon} {btnText}
        </Button>
        {isOpen && children}
      </div>
    );
  };

  if (!posts.length) {
    return null;
  }

  return (
    <CollapsableContainer>
      {posts.map((post) => (
        <Card key={post.link}>
          <CardHeader>
            <CardTitle>{post.username}</CardTitle>
          </CardHeader>
          <CardContent>
            {post.text}
            <a
              href={post.link}
              target="_blank"
              rel="noreferrer"
              className="flex gap-1 items-center justify-end text-sm"
            >
              <ArrowUpRightSquare width={16} height={16} /> View
            </a>
          </CardContent>
        </Card>
      ))}
    </CollapsableContainer>
  );
}
