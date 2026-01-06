"use client";

import { useEffect, useState } from "react";
import { listNotes } from "@/lib/notes";
import NoteList from "@/components/ui/notes/NoteList";
import Link from "next/link";
import { useSwipeBack } from "@/hooks/useSwipeBack";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    listNotes().then(setNotes);
  }, []);
useSwipeBack();
  return <div className="flex-col gap-4 m-6">
      <h3 className=" p-4 font-bold text-gray-400 text-2xl">Notes</h3>
  <Link
        href="/create"
        className=" inline-block mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Note
      </Link>
  <NoteList notes={notes}/> </div>;
}
