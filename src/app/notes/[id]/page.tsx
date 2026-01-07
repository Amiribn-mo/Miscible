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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    setDeleting(true);
    await deleteNote(noteId);
    router.push("/notes");
  };

  if (checking || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-white dark:bg-neutral-900">
        <header className="flex-shrink-0 pt-safe pb-3 px-4 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => router.push("/notes")}
              className="p-2 -ml-2 active:bg-gray-100 dark:active:bg-neutral-800 rounded-lg transition-colors touch-manipulation"
            >
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-md text-gray-500 dark:text-gray-400">
                {saving ? "Saving..." : "Saved"}
              </span>
              <button
                onClick={() => setShowDeleteModal(true)}
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
          <div className="px-4 py-4 space-y-4">
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-1">
                  Delete Note?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This note will be permanently deleted. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-neutral-700 text-black dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-neutral-600 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}