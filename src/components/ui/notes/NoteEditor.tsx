"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function NoteEditor({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
}: {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(title, content);
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <Input
        label="Title"                  
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      <textarea
        className="w-full min-h-[200px] rounded-xl border p-3 text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note..."
      />

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}