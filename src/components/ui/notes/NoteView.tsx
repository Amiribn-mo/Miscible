"use client";

import Button from "@/components/ui/Button";

export default function NoteView({
  title,
  content,
  onEdit,
  onDelete,
}: {
  title: string;
  content: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>

      <article className="rounded-xl border p-4 bg-background">
        <pre className="whitespace-pre-wrap text-sm">{content}</pre>
      </article>

      <div className="flex gap-2">
        <Button onClick={onEdit}>Edit</Button>
        <Button variant="danger" onClick={onDelete}>
  Delete
</Button>
      </div>
    </div>
  );
}
