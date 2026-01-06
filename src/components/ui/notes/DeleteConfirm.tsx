"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Card className="p-4 space-y-4 border-red-500">
      <p className="text-sm text-red-600">
        This note will be permanently deleted. This action cannot be undone.
      </p>

      <div className="flex gap-2 justify-end">  {/* Added justify-end for better UX */}
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
        <Button variant="ghost" onClick={onCancel}>  {/* Or "secondary" / "outline" if available */}
          Cancel
        </Button>
      </div>
    </Card>
  );
}