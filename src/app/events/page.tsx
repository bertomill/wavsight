'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { format } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
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
  full_content: string;
  relevance_score: number;
  event_link: string;
  so_what: string | null;
  key_questions: { id: string; question: string }[];
  answers: { question_id: string; answer: string }[];
  event_type_id: string | null;
  custom_event_type: string | null;
  event_type?: { name: string } | null;
}

interface TableMeta {
  onEdit: (event: TechEvent) => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'table' | 'calendar';

const columnHelper = createColumnHelper<TechEvent>();

const SoWhatCell = ({ row }: { row: TechEvent }) => {
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
};

export default function EventsPage() {
  const [events, setEvents] = useState<TechEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TechEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('tech_events')
      .select(`
        *,
        event_type:event_type_id(name)
      `)
      .order('relevance_score', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    setEvents(data || []);
  };

  const handleEdit = (event: TechEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('tech_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return;
    }

    fetchEvents();
  };

  const columns = [
    columnHelper.accessor('event_name', {
      header: 'Event Name',
      cell: info => info.getValue().replace(/^7p\s*/, ''),
    }),
    columnHelper.accessor(row => row.event_type?.name || row.custom_event_type || 'N/A', {
      id: 'event_type',
      header: 'Type',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('event_link', {
      header: 'Event Link',
      cell: info => info.getValue() ? (
        <a
          href={info.getValue()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B4513] hover:text-[#A0522D] underline"
        >
          View Event
        </a>
      ) : null,
    }),
    columnHelper.accessor('event_date', {
      header: 'Date',
      cell: info => format(new Date(info.getValue()), 'MMM d, yyyy'),
    }),
    columnHelper.accessor('relevance_score', {
      header: 'Relevance',
      cell: info => (
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                star <= info.getValue()
                  ? 'text-yellow-400'
                  : 'text-gray-400'
              }`}
            >
              ★
            </span>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('full_content', {
      header: 'Full Content',
      cell: info => {
        const content = info.getValue();
        if (!content) return null;
        
        // Show first 200 characters with ellipsis if longer
        const truncated = content.length > 200 ? content.slice(0, 200) + '...' : content;
        
        return (
          <div className="group relative">
            <div className="text-sm text-gray-300">{truncated}</div>
            {content.length > 200 && (
              <div className="hidden group-hover:block absolute z-10 left-0 top-full mt-2 p-4 bg-gray-800 rounded-lg shadow-lg max-w-2xl">
                <div className="text-sm text-gray-300 whitespace-pre-wrap">{content}</div>
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor('description', {
      header: 'Recap',
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
      cell: info => <SoWhatCell row={info.row.original} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(info.row.original)}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const calendarEvents = events.map(event => ({
    title: `[${event.event_type?.name || event.custom_event_type || 'Event'}] ${event.event_name.replace(/^7p\s*/, '')}`,
    date: event.event_date,
    extendedProps: {
      description: event.description,
      relevance_score: event.relevance_score,
      id: event.id
    },
    classNames: `relevance-${event.relevance_score}`
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Tech Events</h1>
        <div className="flex gap-4 items-center">
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#8B4513] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#8B4513] text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Calendar
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
          >
            Add Event
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[rgba(255,255,255,0.08)] rounded-lg">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-400 border-b border-[rgba(255,255,255,0.1)]"
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
                  className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-300 border-b border-[rgba(255,255,255,0.1)]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[rgba(255,255,255,0.08)] rounded-lg p-6">
          <style jsx global>{`
            .fc-event {
              white-space: normal !important;
              font-size: 0.75rem !important;
              line-height: 1.1 !important;
              padding: 2px 4px !important;
            }
            .fc-event-time {
              display: none !important;
            }
            .relevance-5 { background-color: #8B4513 !important; border-color: #A0522D !important; }
            .relevance-4 { background-color: #9B5523 !important; border-color: #B0623D !important; }
            .relevance-3 { background-color: #AB6533 !important; border-color: #C0724D !important; }
            .relevance-2 { background-color: #BB7543 !important; border-color: #D0825D !important; }
            .relevance-1 { background-color: #CB8553 !important; border-color: #E0926D !important; }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={(info) => {
              const event = events.find(e => e.id === info.event.extendedProps.id);
              if (event) {
                handleEdit(event);
              }
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            height="auto"
            eventDisplay="block"
            eventTextColor="white"
            eventClassNames="cursor-pointer hover:brightness-110 transition-all"
            dayHeaderClassNames="text-gray-400"
            dayCellClassNames="text-gray-300"
          />
        </div>
      )}

      <AddEditEventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEventAdded={fetchEvents}
      />
    </div>
  );
}
