'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { format } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import AddEditEventModal from '@/components/AddEditEventModal';

interface TechEvent {
  id: string;
  event_name: string;
  event_date: string;
  description: string;
  relevance_score: number;
  so_what: string | null;
  key_questions: { id: string; question: string }[];
  answers: { question_id: string; answer: string }[];
}

const columnHelper = createColumnHelper<TechEvent>();

const columns = [
  columnHelper.accessor('event_name', {
    header: 'Event Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('event_date', {
    header: 'Date',
    cell: info => format(new Date(info.getValue()), 'MMM d, yyyy'),
  }),
  columnHelper.accessor('relevance_score', {
    header: 'Relevance',
    cell: info => {
      const score = info.getValue();
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-4 h-4 ${star <= score ? 'text-yellow-500' : 'text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('key_questions', {
    header: 'Key Questions',
    cell: info => (
      <ul className="list-disc pl-4">
        {info.getValue().map(q => (
          <li key={q.id}>{q.question}</li>
        ))}
      </ul>
    ),
  }),
  columnHelper.accessor('answers', {
    header: 'Answers',
    cell: info => (
      <ul className="list-disc pl-4">
        {info.getValue().map(a => (
          <li key={a.question_id}>{a.answer}</li>
        ))}
      </ul>
    ),
  }),
  columnHelper.accessor('so_what', {
    header: 'So What?',
    cell: info => {
      const row = info.row.original;
      const [loading, setLoading] = useState(false);
      const [soWhat, setSoWhat] = useState(row.so_what);

      const generateSoWhat = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/generate-so-what', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventName: row.event_name,
              description: row.description,
              questions: row.key_questions,
              answers: row.answers,
            }),
          });

          if (!response.ok) throw new Error('Failed to generate analysis');

          const data = await response.json();
          setSoWhat(data.soWhat);

          // Update in Supabase
          await supabase
            .from('tech_events')
            .update({ so_what: data.soWhat })
            .eq('id', row.id);

        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="relative">
          {soWhat ? (
            <div className="group">
              <p className="text-sm text-gray-300">{soWhat}</p>
              <button
                onClick={generateSoWhat}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-xs text-gray-400 hover:text-white transition-opacity"
                title="Regenerate analysis"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={generateSoWhat}
              disabled={loading}
              className="px-2 py-1 text-xs bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate Analysis'
              )}
            </button>
          )}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: props => (
      <div className="flex gap-2">
        <button
          onClick={() => props.table.options.meta?.onEdit(props.row.original)}
          className="px-2 py-1 text-xs bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => props.table.options.meta?.onDelete(props.row.original.id)}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    ),
  }),
];

export default function EventsPage() {
  const [events, setEvents] = useState<TechEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TechEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('tech_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const { error } = await supabase
          .from('tech_events')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit: (event: TechEvent) => {
        setEditingEvent(event);
        setShowAddModal(true);
      },
      onDelete: handleDelete,
    },
  });

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Tech Events</h1>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
          >
            Add Event
          </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-xl p-6 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B4513]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No events found. Add your first event!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="text-left p-3 text-sm font-medium text-gray-400 border-b border-[rgba(255,255,255,0.1)]"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-3 text-sm text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showAddModal && (
          <AddEditEventModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            event={editingEvent}
            onEventAdded={fetchEvents}
          />
        )}
      </div>
    </main>
  );
}
