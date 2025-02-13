'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import Modal from './Modal';

interface EventType {
  id: string;
  name: string;
}

interface TechEvent {
  id: string;
  event_name: string;
  event_date: string;
  description: string;
  full_content: string;
  relevance_score: number;
  event_link: string;
  key_questions: { id: string; question: string }[];
  answers: { question_id: string; answer: string }[];
  event_type_id: string | null;
  custom_event_type: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event?: TechEvent;
  onEventAdded: () => void;
}

export default function AddEditEventModal({ isOpen, onClose, event, onEventAdded }: Props) {
  const [loading, setLoading] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);
  const [customEventType, setCustomEventType] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [generatingRecap, setGeneratingRecap] = useState(false);
  const [generatingAnswers, setGeneratingAnswers] = useState<{ [key: number]: boolean }>({});
  const initialFormData = {
    event_name: '',
    event_date: '',
    description: '',
    full_content: '',
    event_link: '',
    relevance_score: 3,
    questions: [''],
    answers: ['']
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchEventTypes();
    if (event) {
      setSelectedEventType(event.event_type_id || null);
      setCustomEventType(event.custom_event_type || '');
      setShowCustomType(!!event.custom_event_type);
      setFormData({
        event_name: event.event_name || '',
        event_date: event.event_date || '',
        description: event.description || '',
        full_content: event.full_content || '',
        event_link: event.event_link || '',
        relevance_score: event.relevance_score || 3,
        questions: event.key_questions?.map(q => q.question) || [''],
        answers: event.key_questions?.map(q => {
          const answer = event.answers?.find(a => a.question_id === q.id)?.answer;
          return answer || '';
        }) || ['']
      });
    } else {
      // Reset form when opening for new event
      setFormData(initialFormData);
      setSelectedEventType(null);
      setCustomEventType('');
      setShowCustomType(false);
    }
  }, [event, isOpen]); // Added isOpen to dependencies to ensure reset when modal opens

  const fetchEventTypes = async () => {
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching event types:', error);
      return;
    }

    setEventTypes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const questions = formData.getAll('questions');
      const answers = formData.getAll('answers');
      
      const eventData = {
        event_name: formData.get('event_name'),
        event_date: formData.get('event_date'),
        description: formData.get('description'),
        full_content: formData.get('full_content'),
        event_link: formData.get('event_link'),
        relevance_score: parseInt(formData.get('relevance_score') as string),
        event_type_id: showCustomType ? null : selectedEventType,
        custom_event_type: showCustomType ? customEventType : null,
        key_questions: questions.map((q, i) => ({
          id: event?.key_questions?.[i]?.id || crypto.randomUUID(),
          question: q,
        })).filter(q => q.question),
        answers: questions.map((_, i) => ({
          question_id: event?.key_questions?.[i]?.id || crypto.randomUUID(),
          answer: answers[i] || ''
        })).filter((_, i) => questions[i])
      };

      if (event?.id) {
        const { error } = await supabase
          .from('tech_events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tech_events')
          .insert([eventData]);

        if (error) throw error;
      }

      onEventAdded();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = e.target.value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const handleAnswerChange = (index: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = e.target.value;
    setFormData(prev => ({ ...prev, answers: newAnswers }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ''],
      answers: [...prev.answers, '']
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async () => {
    if (!event?.id || !confirm('Are you sure you want to delete this event?')) return;
    
    const { error } = await supabase
      .from('tech_events')
      .delete()
      .eq('id', event.id);

    if (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
      return;
    }

    onEventAdded(); // Refresh the events list
    onClose();
  };

  const generateAnswer = async (index: number) => {
    const form = document.querySelector('form');
    if (!form) return;
    
    const formValues = new FormData(form);
    const eventData = {
      event_name: formValues.get('event_name'),
      event_type: showCustomType ? customEventType : eventTypes.find(t => t.id === selectedEventType)?.name || 'Event',
      full_content: formValues.get('full_content'),
      question: formData.questions[index]
    };

    if (!eventData.full_content) {
      alert('Please add full content first to generate an answer');
      return;
    }

    if (!eventData.question.trim()) {
      alert('Please add a question first');
      return;
    }

    setGeneratingAnswers(prev => ({ ...prev, [index]: true }));
    try {
      const response = await fetch('/api/generate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) throw new Error('Failed to generate answer');

      const data = await response.json();
      setFormData(prevFormData => {
        const newAnswers = [...prevFormData.answers];
        newAnswers[index] = data.answer;
        return {
          ...prevFormData,
          answers: newAnswers
        };
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate answer. Please try again.');
    } finally {
      setGeneratingAnswers(prev => ({ ...prev, [index]: false }));
    }
  };

  const generateRecap = async () => {
    const form = document.querySelector('form');
    if (!form) return;
    
    const formValues = new FormData(form);
    const eventData = {
      event_name: formValues.get('event_name'),
      event_type: showCustomType ? customEventType : eventTypes.find(t => t.id === selectedEventType)?.name || 'Event',
      full_content: formValues.get('full_content'),
    };

    if (!eventData.full_content) {
      alert('Please add full content first to generate a recap');
      return;
    }

    setGeneratingRecap(true);
    try {
      const response = await fetch('/api/generate-recap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) throw new Error('Failed to generate recap');

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        description: data.recap
      }));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate recap. Please try again.');
    } finally {
      setGeneratingRecap(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#1a1a1a] rounded-lg p-8 w-[95%] md:w-1/3 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">
            {event ? 'Edit Event' : 'Add Event'}
          </h2>
          <div className="flex items-center gap-3">
            {event && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete event"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Event Name
            </label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={handleInputChange}
              className="w-full bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Event Link
            </label>
            <input
              type="url"
              name="event_link"
              value={formData.event_link}
              onChange={handleInputChange}
              className="w-full bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Event Type
            </label>
            <div className="flex gap-4 items-center mb-2">
              <select
                value={selectedEventType}
                onChange={(e) => {
                  setSelectedEventType(e.target.value);
                  setShowCustomType(e.target.value === 'custom');
                }}
                className="flex-1 bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              >
                <option value="">Select Type</option>
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
                <option value="custom">+ Add Custom Type</option>
              </select>
            </div>
            {showCustomType && (
              <input
                type="text"
                value={customEventType}
                onChange={(e) => setCustomEventType(e.target.value)}
                placeholder="Enter custom event type"
                className="w-full bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleInputChange}
              className="w-full bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Full Content
            </label>
            <textarea
              name="full_content"
              value={formData.full_content}
              onChange={handleInputChange}
              className="w-full bg-[#2a2a2a] text-xs leading-relaxed text-white rounded-lg p-3 h-40 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-xs font-medium text-gray-300">
                Recap
              </label>
              <button
                type="button"
                onClick={generateRecap}
                disabled={generatingRecap}
                className="px-3 py-1 bg-[#8B4513] text-xs text-white rounded hover:bg-[#A0522D] transition-colors disabled:opacity-50"
              >
                {generatingRecap ? 'Generating...' : 'Generate AI Recap'}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-[#2a2a2a] text-xs leading-relaxed text-white rounded-lg p-3 h-28 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Relevance Score (1-5)
            </label>
            <input
              type="number"
              name="relevance_score"
              value={formData.relevance_score}
              onChange={handleInputChange}
              min={1}
              max={5}
              required
              className="w-full bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Questions & Answers
            </label>
            <div className="space-y-4">
              {formData.questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="questions"
                      value={question}
                      onChange={(e) => handleQuestionChange(index, e)}
                      placeholder="Enter your question"
                      className="flex-1 bg-[#2a2a2a] text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      name="answers"
                      value={formData.answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e)}
                      placeholder="Enter answer"
                      className="flex-1 bg-[#2a2a2a] text-xs leading-relaxed text-white rounded-lg p-3 h-24 focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
                    />
                    <button
                      type="button"
                      onClick={() => generateAnswer(index)}
                      disabled={generatingAnswers[index]}
                      className="px-3 py-1 bg-[#8B4513] text-xs text-white rounded hover:bg-[#A0522D] transition-colors disabled:opacity-50 h-fit"
                    >
                      {generatingAnswers[index] ? 'Generating...' : 'Generate AI Answer'}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-[#8B4513] hover:text-[#A0522D] flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : event ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
