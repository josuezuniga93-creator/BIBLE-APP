"use client";

import Markdown from "react-markdown";
import { NotebookPen, Trash2 } from "lucide-react";
import { Sheet, IconButton } from "./Views";
import { getNoteDisplayRef, type SermonNote } from "../../lib/notesData";

export default function NoteView({
  note,
  onEdit,
  onDelete,
  onClose,
}: {
  note: SermonNote;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="Your notebook" full onClose={onClose}>
      <div className="note-view">
        <div className="note-view-actions">
          <span>
            {note.noteType === "general" ? "Journal" : getNoteDisplayRef(note)}
          </span>
          <IconButton icon={NotebookPen} label="Edit note" onClick={onEdit} />
          <IconButton icon={Trash2} label="Delete note" onClick={onDelete} />
        </div>
        <h1>{note.title}</h1>
        <div className="prose">
          <Markdown>{note.notes}</Markdown>
        </div>
      </div>
    </Sheet>
  );
}
