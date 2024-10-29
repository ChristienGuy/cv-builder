import { createFileRoute } from "@tanstack/react-router";
import { useRxCollection, useRxData } from "rxdb-hooks";
import { SnippetDocType } from "../db/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/auth-context";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function useSnippets() {
  const collection = useRxCollection<SnippetDocType>("snippets");

  const { result: snippets } = useRxData<SnippetDocType>(
    "snippets",
    (collection) => collection.find()
  );

  const addSnippet = async (snippet: Omit<SnippetDocType, "id">) => {
    return collection?.insert({
      id: createId(),
      ...snippet,
    });
  };

  const deleteSnippet = async (snippet: SnippetDocType) => {
    const snippetDoc = collection?.findOne(snippet.id);
    return snippetDoc?.remove();
  };

  const updateSnippet = async (snippet: SnippetDocType, content: string) => {
    const snippetDoc = collection?.findOne(snippet.id);
    return snippetDoc?.patch({ content });
  };

  return {
    snippets,
    addSnippet,
    deleteSnippet,
    updateSnippet,
  };
}

function IndexPage() {
  const { snippets, addSnippet } = useSnippets();
  const { user } = useAuth();

  const [content, setContent] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addSnippet({ content, user_id: user.id });
  };

  return (
    <div className="grid gap-4 p-8">
      <div>
        <h1>Snippets</h1>
        <form className="flex flex-row gap-4" onSubmit={handleSubmit}>
          <Textarea onChange={(event) => setContent(event.target.value)} />
          <Button type="submit">Add</Button>
        </form>

        <ul>
          {snippets?.map((snippet) => (
            <SnippetListItem key={snippet.id} snippet={snippet} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SnippetListItem({ snippet }: { snippet: SnippetDocType }) {
  const { deleteSnippet, updateSnippet } = useSnippets();
  const [snippetEditContent, setSnippetEditContent] = useState(snippet.content);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <li key={snippet.id}>
      {isEditing ? (
        <>
          <Textarea
            onChange={(event) => setSnippetEditContent(event.target.value)}
            value={snippetEditContent}
          />
          <Button
            onClick={async () => {
              await updateSnippet(snippet, snippetEditContent);
              setIsEditing(false);
            }}
          >
            Save
          </Button>
        </>
      ) : (
        <p onClick={() => setIsEditing(true)}>{snippet.content}</p>
      )}
      <Button onClick={() => deleteSnippet(snippet)}>delete</Button>
    </li>
  );
}
