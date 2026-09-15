"use client";

import { useState } from "react";
import { researchKeywordsAction } from "@/server/actions/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { KeywordInsight } from "@/lib/seo/keyword-provider";

export default function KeywordsPage() {
  const [rows, setRows] = useState<KeywordInsight[]>([]);

  return (
    <div>
      <PageHeader
        title="Keyword research"
        description="Provider abstraction is in place. Demo data is used until Keyword Planner / DataForSEO credentials exist."
      />
      <form
        className="mb-6 flex max-w-lg gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const keyword = String(new FormData(event.currentTarget).get("keyword") || "");
          setRows(await researchKeywordsAction(keyword));
        }}
      >
        <Input name="keyword" placeholder="digital marketing automation" required />
        <Button type="submit">Research</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Competition</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.keyword}>
              <TableCell>{row.keyword}</TableCell>
              <TableCell>{row.searchVolume}</TableCell>
              <TableCell>{row.difficulty}</TableCell>
              <TableCell>{row.intent}</TableCell>
              <TableCell>{row.trend}</TableCell>
              <TableCell>{row.competition}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
