"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNote } from "@/lib/notes";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CreatePage() {
  const router = useRouter();
  const { checking, authenticated } = useRequireAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    try {
      const noteId = await createNote(title, content);
      router.push(`/notes/${noteId}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note");
      setCreating(false);
    }
  };

  if (checking) {
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
          >
            {creating ? "Creating..." : "Done"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain pb-safe">
        <div className="px-4 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
            className="w-full text-2xl font-bold bg-transparent outline-none mb-4 placeholder-gray-300 dark:placeholder-gray-600"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="w-full min-h-[calc(100vh-12rem)] resize-none bg-transparent outline-none text-base leading-relaxed placeholder-gray-300 dark:placeholder-gray-600"
          />
        </div>
      </main>
    </div>
  );
}