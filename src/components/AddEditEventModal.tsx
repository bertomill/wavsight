import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface TechEvent {
  id: string;
  event_name: string;
  event_date: string;
  description: string;
  relevance_score: number;
  key_questions: { id: string; question: string }[];
  answers: { question_id: string; answer: string }[];
}

interface AddEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: TechEvent | null;
  onEventAdded: () => void;
}

export default function AddEditEventModal({
  isOpen,
  onClose,
  event,
  onEventAdded,
}: AddEditEventModalProps) {
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    description: '',
    relevance_score: 3,
    questions: [''],
    answers: [''],
  });

  useEffect(() => {
    if (event) {
      setFormData({
        event_name: event.event_name,
        event_date: event.event_date.split('T')[0], // Convert to YYYY-MM-DD
        description: event.description,
        relevance_score: event.relevance_score || 3,
        questions: event.key_questions.map(q => q.question),
        answers: event.answers.map(a => a.answer),
      });
    } else {
      setFormData({
        event_name: '',
        event_date: '',
        description: '',
        relevance_score: 3,
        questions: [''],
        answers: [''],
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const key_questions = formData.questions
      .filter(q => q.trim())
      .map((question, index) => ({
        id: String(index + 1),
        question,
      }));

    const answers = formData.answers
      .filter((a, index) => a.trim() && formData.questions[index]?.trim())
      .map((answer, index) => ({
        question_id: String(index + 1),
        answer,
      }));

    try {
      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('tech_events')
          .update({
            event_name: formData.event_name,
            event_date: formData.event_date,
            description: formData.description,
            relevance_score: formData.relevance_score,
            key_questions,
            answers,
          })
          .eq('id', event.id);

        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase.from('tech_events').insert([
          {
            event_name: formData.event_name,
            event_date: formData.event_date,
            description: formData.description,
            relevance_score: formData.relevance_score,
            key_questions,
            answers,
          },
        ]);

        if (error) throw error;
      }

      onEventAdded();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ''],
      answers: [...prev.answers, ''],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      answers: prev.answers.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {event ? 'Edit Event' : 'Add New Event'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Event Name
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={e =>
                setFormData(prev => ({ ...prev, event_name: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={e =>
                setFormData(prev => ({ ...prev, event_date: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Relevance Score
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, relevance_score: score }))}
                  className={`p-2 rounded-lg transition-colors ${
                    formData.relevance_score >= score
                      ? 'text-yellow-500 hover:text-yellow-400'
                      : 'text-gray-600 hover:text-gray-500'
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Questions & Answers
            </label>
            <div className="space-y-3">
              {formData.questions.map((question, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Question"
                      value={question}
                      onChange={e => {
                        const newQuestions = [...formData.questions];
                        newQuestions[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          questions: newQuestions,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Answer (optional)"
                      value={formData.answers[index] || ''}
                      onChange={e => {
                        const newAnswers = [...formData.answers];
                        newAnswers[index] = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          answers: newAnswers,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors"
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="px-2 py-1 text-red-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="mt-2 text-sm text-[#8B4513] hover:text-[#A0522D]"
            >
              + Add Question
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
            >
              {event ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
