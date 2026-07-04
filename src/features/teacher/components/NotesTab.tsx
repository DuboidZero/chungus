import { useState } from 'react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Pencil, Trash2, Check, X, Plus, Lock } from 'lucide-react';
import type { PrivateNote } from '../../../api/entities/teacher';
import { createPrivateNote, updatePrivateNote, deletePrivateNote } from '../../../api/services/teacher';

interface Props {
  notes: PrivateNote[];
  studentId: string;
  /** ID of the currently logged-in teacher (to gate edit/delete) */
  currentTeacherId?: string;
  onNotesChange?: (notes: PrivateNote[]) => void;
}

export function NotesTab({ notes: initialNotes, studentId, currentTeacherId, onNotesChange }: Props) {
  const [notes, setNotes] = useState<PrivateNote[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const note = await createPrivateNote(studentId, { content: newNote.trim() });
      const updated = [note, ...notes];
      setNotes(updated);
      onNotesChange?.(updated);
      setNewNote('');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      const updated = await updatePrivateNote(studentId, noteId, editContent.trim());
      setNotes(prev => prev.map(n => n.id === noteId ? updated : n));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deletePrivateNote(studentId, noteId);
      const updated = notes.filter(n => n.id !== noteId);
      setNotes(updated);
      onNotesChange?.(updated);
      setDeletingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Compose new note */}
      <Card className="border-outline-variant">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Private — visible to teachers and admins only
            </p>
          </div>
          <textarea
            className="w-full min-h-[100px] p-3 text-sm bg-surface-container-low border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface resize-y"
            placeholder="Write a private note about this student..."
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAdd(); }}
          />
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-on-surface-variant/70">Ctrl+Enter to save</p>
            <button
              onClick={handleAdd}
              disabled={!newNote.trim() || saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white text-sm font-medium rounded-md hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              {saving ? 'Saving…' : 'Add Note'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notes list */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-center text-on-surface-variant py-10">
            No private notes recorded yet.
          </p>
        ) : (
          notes.map(note => {
            const canEdit = !currentTeacherId || note.teacherId === currentTeacherId;
            const isEditing = editingId === note.id;
            const isConfirmingDelete = deletingId === note.id;

            return (
              <Card
                key={note.id}
                className="bg-amber-50/30 border-amber-100"
              >
                <CardContent className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                        {note.teacherName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{note.teacherName}</p>
                        <p className="text-xs text-on-surface-variant/70">
                          {new Date(note.createdAt).toLocaleString()}
                          {note.updatedAt !== note.createdAt && (
                            <span className="ml-1 italic">(edited)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {canEdit && !isEditing && !isConfirmingDelete && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                          className="p-1.5 rounded text-on-surface-variant/70 hover:text-primary hover:bg-surface-container-low transition-colors"
                          title="Edit note"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(note.id)}
                          className="p-1.5 rounded text-on-surface-variant/70 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body: edit mode */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        className="w-full min-h-[80px] p-2 text-sm bg-white border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-on-surface resize-y"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-on-surface-variant border border-outline-variant rounded hover:bg-surface-container"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(note.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-container text-white rounded hover:bg-primary"
                        >
                          <Check className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : isConfirmingDelete ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-2">
                      <p className="text-sm text-red-700">Delete this note permanently?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-3 py-1.5 text-xs border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{note.content}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
