import CreateNoteForm from "@/components/ui/CreateNoteForm";

export default function CreatePage() {
  return (
    <main className="p-4 sm:p-8 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Create Secure Note
      </h1>
      <CreateNoteForm />
    </main>
  );
}
