"use client";

import { useEffect, useState } from "react";
import { listNotes } from "@/lib/notes";
import NoteList from "@/components/ui/notes/NoteList";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listNotes().then(setNotes);
  }, []);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <input
        placeholder="Search notes…"
        className="w-full border rounded px-3 py-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <NoteList notes={filtered} />
    </main>
  );
}
