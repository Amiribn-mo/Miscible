"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { createNote } from "@/lib/notes";
import Link from "next/link";

export default function CreateNoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !content) {
      setError("Please fill in both title and content");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const noteId = await createNote(title, content);
      router.push(`/notes/${noteId}`);
    } catch (err) {
      console.error("Failed to create note:", err);
      setError(err instanceof Error ? err.message : "Failed to create note");
      setLoading(false);
    }
  };

  return (
    <Card>
      <Link href="/notes" className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        ← Notes
      </Link>
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          label="Title"
        />

        <textarea
          className="w-full min-h-[140px] rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Write your secure note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Encrypting..." : "Save Secure Note"}
        </Button>
      </div>
    </Card>
  );
}