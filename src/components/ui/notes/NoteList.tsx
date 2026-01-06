"use client";

import NoteCard from "./NoteCard";

type Note = {
  id: number;
  title: string;
};

export default function NoteList({ notes }: { notes: Note[] }) {
  return (<>


    {/* <div className="grid gap-4 sm:grid-cols-2 p-2"> */}
    <div className="flex flex-wrap gap-4 p-2">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div></>
  );
}
