import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Brain } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getNotes, addNote, deleteNote, generateFollowUp } from '../../lib/api';
import { LoadingSpinner } from '../shared/UI';

interface Props {
  leadId: number;
}

export default function NotesPanel({ leadId }: Props) {
  const [newNote, setNewNote] = useState('');
  const [followUp, setFollowUp] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notes', leadId],
    queryFn: () => getNotes(leadId).then((r) => r.data),
  });

  const addMutation = useMutation({
    mutationFn: () => addNote(leadId, newNote),
    onSuccess: () => {
      setNewNote('');
      qc.invalidateQueries({ queryKey: ['notes', leadId] });
      toast.success('Note added');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: number) => deleteNote(noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', leadId] }),
  });

  const followUpMutation = useMutation({
    mutationFn: () => generateFollowUp(leadId),
    onSuccess: (res) => setFollowUp(res.data),
    onError: () => toast.error('Follow-up generation failed'),
  });

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <div>
        <div className="section-title">Add Note</div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this lead..."
          className="input text-sm resize-none h-20"
        />
        <button
          onClick={() => addMutation.mutate()}
          disabled={!newNote.trim() || addMutation.isPending}
          className="btn-primary mt-2 flex items-center gap-2 text-sm"
        >
          {addMutation.isPending ? <LoadingSpinner size={14} /> : <Plus size={14} />}
          Add Note
        </button>
      </div>

      {/* Smart Follow-Up */}
      <div className="panel-section">
        <div className="section-title">Smart Follow-Up AI</div>
        <button
          onClick={() => followUpMutation.mutate()}
          disabled={followUpMutation.isPending}
          className="btn-secondary flex items-center gap-2 text-sm w-full justify-center"
        >
          {followUpMutation.isPending ? <LoadingSpinner size={14} /> : <Brain size={14} />}
          {followUpMutation.isPending ? 'Thinking...' : 'Suggest Next Action'}
        </button>
        {followUp && (
          <div className="mt-3 space-y-2">
            <div className="card-glow p-3">
              <div className="text-xs text-accent/70 mb-1 font-medium">Recommended Action</div>
              <p className="text-sm text-gray-200">{followUp.next_action}</p>
            </div>
            {followUp.followup_message && (
              <div className="card p-3">
                <div className="text-xs text-gray-500 mb-1 font-medium">Follow-Up Message</div>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                  {followUp.followup_message}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div>
        <div className="section-title">Notes ({data?.length || 0})</div>
        {isLoading ? (
          <div className="flex justify-center py-4"><LoadingSpinner /></div>
        ) : data?.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No notes yet. Add one above.</p>
        ) : (
          <div className="space-y-2">
            {data?.map((note: any) => (
              <div key={note.id} className="card p-3 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-300 leading-relaxed flex-1">{note.content}</p>
                  <button
                    onClick={() => deleteMutation.mutate(note.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="text-[10px] text-gray-600 mt-1.5 font-mono">
                  {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
