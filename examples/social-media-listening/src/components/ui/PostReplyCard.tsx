import { Avatar, AvatarFallback, Card, CardContent, CardFooter, CardHeader } from "@local/ui";

export function PostReplyCard({
  username,
  originalPost,
  generatedReply,
}: {
  username: string;
  originalPost: string;
  generatedReply: string;
}) {
  const authorAvatar = username.replace("@", "").charAt(0);
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarFallback>{authorAvatar}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{username}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{originalPost}</p>
      </CardContent>
      <CardFooter>
        <div className="border-t pt-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">Your reply:</span>
          </div>
          <p className="text-sm">{generatedReply}</p>
        </div>
      </CardFooter>
    </Card>
  );
}
