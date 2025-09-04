'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedSdkCode, setCopiedSdkCode] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project'],
    queryFn: async () => {
      const response = await api.get('/api/projects/current');
      return response.data.data;
    },
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/api/projects/regenerate-key');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });

  const copyToClipboard = async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sdkInitCode = `import ExperimentLab from '@experimentlab/sdk';

const experimentLab = new ExperimentLab({
  apiKey: '${project?.apiKey || 'YOUR_API_KEY'}',
  apiUrl: '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}'
});

// Get variant for a user
const variant = await experimentLab.getVariant('experiment-id', 'user-id');

// Track conversion
experimentLab.conversion('experiment-id', {
  revenue: 99.99
});`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your project settings and API configuration
        </p>
      </div>

      {/* Project Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <p className="mt-1 text-sm text-gray-900">{project?.name || 'My Project'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Project ID</label>
            <p className="mt-1 text-sm text-gray-500 font-mono">{project?.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Owner</label>
            <p className="mt-1 text-sm text-gray-900">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={project?.apiKey || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => copyToClipboard(project?.apiKey || '', setCopiedApiKey)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {copiedApiKey ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Use this API key to authenticate SDK requests. Keep it secret!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
            <input
              type="text"
              value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to regenerate your API key? The old key will stop working immediately.')) {
                  regenerateKeyMutation.mutate();
                }
              }}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Regenerate API Key
            </button>
          </div>
        </div>
      </div>

      {/* SDK Installation */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SDK Installation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">1. Install the SDK</h3>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg">
              <code className="text-sm">npm install @experimentlab/sdk</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">2. Initialize in your application</h3>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{sdkInitCode}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(sdkInitCode, setCopiedSdkCode)}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                {copiedSdkCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Start Guide</h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>The SDK automatically handles variant assignment caching</li>
              <li>Events are batched for optimal performance</li>
              <li>Use consistent user IDs for accurate tracking</li>
              <li>Call <code className="bg-blue-100 px-1 rounded">track()</code> for custom events</li>
              <li>Call <code className="bg-blue-100 px-1 rounded">conversion()</code> for conversion events</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Phase 1 Limitations</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Single project per user</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Maximum 2 variants per experiment (Control + Variant)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>50/50 traffic split only</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Basic conversion tracking only</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}