"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getNote, updateNote, deleteNote } from "@/lib/notes";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const noteId = Number(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  // Load note
  useEffect(() => {
    getNote(noteId).then((n) => {
      if (!n) return;
      setTitle(n.title);
      setContent(n.content);
    });
  }, [noteId]);

  // Autosave
  useEffect(() => {
    if (!title && !content) return;

    setSaving(true);
    const t = setTimeout(async () => {
      await updateNote(noteId, title, content);
      setSaving(false);
    }, 600);

    return () => clearTimeout(t);
  }, [title, content, noteId]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/notes")}
            className="text-sm text-neutral-600 dark:text-neutral-300 hover:underline"
          >
            ← Notes
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">
              {saving ? "Saving…" : "Saved"}
            </span>

            <button
              onClick={() => {
                if (confirm("Delete this note permanently?")) {
                  deleteNote(noteId);
                  router.push("/notes");
                }
              }}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <section className="max-w-3xl mx-auto px-4 py-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="
            w-full bg-transparent text-2xl font-semibold
            outline-none mb-4
            text-neutral-900 dark:text-neutral-100
          "
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing…"
          className="
            w-full min-h-[60vh] resize-none
            bg-transparent outline-none
            text-base leading-relaxed
            text-neutral-800 dark:text-neutral-200
          "
        />
      </section>
    </main>
  );
}
