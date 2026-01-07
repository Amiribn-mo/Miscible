"use client";

import { useEffect, useState } from "react";
import { listNotes } from "@/lib/notes";
import Link from "next/link";
import { useSwipeBack } from "@/hooks/useSwipeBack";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { EncryptedNote } from "@/lib/db";

export default function NotesPage() {
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { checking, authenticated } = useRequireAuth();

  useSwipeBack();

  useEffect(() => {
    if (!authenticated) return;
    
    listNotes()
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [authenticated]);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-neutral-900 pt-4">
      <header className="flex-shrink-0 pt-safe pb-4 px-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">Notes</h1>
          <Link
            href="/create"
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium active:scale-95 transition-transform touch-manipulation"
          >
            + New
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain pb-safe">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-black dark:bg-white flex items-center justify-center">
              <svg className="w-12 h-12 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Start Writing</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
              Create your first encrypted note. Everything is secured with your passphrase.
            </p>
            <Link
              href="/create"
              className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-lg font-medium active:scale-95 transition-transform touch-manipulation shadow-lg"
            >
              Create Note
            </Link>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-2">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block p-4 border border-gray-200 dark:border-neutral-700 rounded-2xl active:bg-gray-50 dark:active:bg-neutral-800 transition-colors touch-manipulation"
              >
                <h3 className="font-semibold text-base mb-1 line-clamp-2 text-black dark:text-white">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}