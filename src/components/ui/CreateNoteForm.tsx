"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { createNote } from "@/lib/notes";
import  router, { useRouter } from "next/router";
import Link from "next/link";

export default function CreateNoteForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async () => {
    if (!title || !content) return;

    setLoading(true);
    await createNote(title, content);
    setTitle("");
    setContent("");
    setLoading(false);
  };

  return (
    <Card>
       <Link href={"/notes"} className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
       ← Notes
       </Link>
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)} label={""}        />

        <textarea
          className="w-full min-h-[140px] rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Write your secure note here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Encrypting..." : "Save Secure Note"}
        </Button>
      </div>
    </Card>
  );
}
