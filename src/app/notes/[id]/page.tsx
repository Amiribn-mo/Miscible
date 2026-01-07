"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getNote, updateNote, deleteNote } from "@/lib/notes";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const noteId = Number(id);
  const { checking, authenticated } = useRequireAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authenticated) return;

    getNote(noteId)
      .then((n) => {
        if (!n) {
          router.push("/notes");
          return;
        }
        setTitle(n.title);
        setContent(n.content);
      })
      .finally(() => setLoading(false));
  }, [noteId, router, authenticated]);

  useEffect(() => {
    if (loading || !authenticated) return;
    if (!title && !content) return;

    setSaving(true);
    const timer = setTimeout(async () => {
      await updateNote(noteId, title, content);
      setSaving(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [title, content, noteId, loading, authenticated]);

  if (checking || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-900">
      <header className="flex-shrink-0 pt-safe pb-3 px-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/notes")}
            className="p-2 -ml-2 active:bg-gray-100 dark:active:bg-neutral-800 rounded-lg transition-colors touch-manipulation"
          >
            <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {saving ? "Saving..." : "Saved"}
            </span>
            <button
              onClick={() => {
                if (confirm("Delete this note?")) {
                  deleteNote(noteId);
                  router.push("/notes");
                }
              }}
              className="p-2 text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain pb-safe">
        <div className="px-4 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-2xl font-bold bg-transparent outline-none mb-4 placeholder-gray-300 dark:placeholder-gray-600 text-black dark:text-white"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-12rem)] resize-none bg-transparent outline-none text-base leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 text-black dark:text-white"
          />
        </div>
      </main>
    </div>
  );
}