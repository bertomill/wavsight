'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  preferred_language: string;
  ai_preferences: {
    model: string;
    temperature: number;
    max_tokens: number;
    chain_of_thought: boolean;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      const updates = {
        display_name: formData.get('display_name'),
        bio: formData.get('bio'),
        preferred_language: formData.get('preferred_language'),
        ai_preferences: {
          model: formData.get('ai_model'),
          temperature: parseFloat(formData.get('temperature') as string),
          max_tokens: parseInt(formData.get('max_tokens') as string),
          chain_of_thought: formData.get('chain_of_thought') === 'true'
        },
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profile?.id);

      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">User Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded bg-green-500/10 text-green-400">
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="display_name"
                defaultValue={profile?.display_name}
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                defaultValue={profile?.bio}
                rows={4}
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Language
              </label>
              <select
                name="preferred_language"
                defaultValue={profile?.preferred_language}
                className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">AI Preferences</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  name="ai_model"
                  defaultValue={profile?.ai_preferences.model}
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Temperature (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  name="temperature"
                  defaultValue={profile?.ai_preferences.temperature}
                  step="0.1"
                  min="0"
                  max="1"
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  name="max_tokens"
                  defaultValue={profile?.ai_preferences.max_tokens}
                  step="100"
                  min="100"
                  max="4000"
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:border-[#8B4513]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="chain_of_thought"
                  defaultChecked={profile?.ai_preferences.chain_of_thought}
                  value="true"
                  className="w-4 h-4 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                />
                <label className="text-sm font-medium text-gray-300">
                  Show Chain of Thought
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#A0522D] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Display Name</h3>
              <p className="mt-1 text-white">{profile?.display_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">Bio</h3>
              <p className="mt-1 text-white whitespace-pre-wrap">{profile?.bio}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">Preferred Language</h3>
              <p className="mt-1 text-white">{profile?.preferred_language}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400">AI Preferences</h3>
              <div className="mt-2 space-y-2">
                <p className="text-white">Model: {profile?.ai_preferences.model}</p>
                <p className="text-white">Temperature: {profile?.ai_preferences.temperature}</p>
                <p className="text-white">Max Tokens: {profile?.ai_preferences.max_tokens}</p>
                <p className="text-white">
                  Chain of Thought: {profile?.ai_preferences.chain_of_thought ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
