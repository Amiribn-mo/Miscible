"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";

export default function NoteCard({ note }: { note: { id: number; title: string } }) {
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition ">
        <h3 className="font-medium">{note.title}</h3>
      </Card>
    </Link>
  );
}
