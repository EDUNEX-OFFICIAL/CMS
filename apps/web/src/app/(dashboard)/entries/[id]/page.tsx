import { EntryFormClient } from "@/features/cms/entry-form-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEntryPage({ params }: PageProps) {
  const { id } = await params;
  return <EntryFormClient entryId={id} />;
}
