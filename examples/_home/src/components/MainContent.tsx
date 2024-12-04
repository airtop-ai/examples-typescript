"use client";

import { type ExampleListing, exampleListings, getAppUrl } from "@internal/home-config";
import { Card, CardContent, CardHeader } from "@local/ui";
import Markdown from "react-markdown";

export function MainContent() {
  return (
    <div>
      {Object.values<ExampleListing>(exampleListings).map((listing) => (
        <Card
          key={listing.dirName}
          className="mb-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01]"
          onClick={() => window.open(getAppUrl(listing.dirName), "_blank")}
        >
          <CardHeader className="text-xl font-bold">{listing.metadata.title.replace("Airtop:", "")}</CardHeader>
          <CardContent>
            <Markdown>{listing.metadata.description}</Markdown>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
