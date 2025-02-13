'use client';

import { useState } from 'react';

export default function AIPipelinePage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">AI Pipeline</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2">
          <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-white mb-4">Upload Document</h2>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-2">Coming soon...</p>
                <p className="text-sm text-gray-500">
                  Support for PDF, text, and audio transcripts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar for AI analysis */}
        <div className="lg:col-span-1">
          <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">AI Analysis</h2>
            <div className="text-gray-400">
              <p>Chain of thought analysis will appear here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
