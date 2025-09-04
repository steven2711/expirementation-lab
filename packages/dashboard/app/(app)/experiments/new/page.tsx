'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../../../lib/api';

export default function NewExperimentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trafficAllocation: {
      control: 50,
      variant: 50,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/api/experiments', {
        ...data,
        projectId: session?.project?.id,
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/experiments/${data.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Experiment</h1>
        <p className="mt-2 text-gray-600">
          Set up a new A/B test to optimize your application
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {createMutation.isError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            Failed to create experiment. Please try again.
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Homepage CTA Button Test"
            />
            <p className="mt-1 text-sm text-gray-500">
              Choose a descriptive name for your experiment
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you're testing and why..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Optional: Add context about your hypothesis and expected outcomes
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Traffic Allocation
            </label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="font-medium">Control</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formData.trafficAllocation.control}
                      disabled
                      className="w-20 px-3 py-1 bg-white border border-gray-300 rounded text-center"
                    />
                    <span className="ml-2 text-gray-600">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span className="font-medium">Variant</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formData.trafficAllocation.variant}
                      disabled
                      className="w-20 px-3 py-1 bg-white border border-gray-300 rounded text-center"
                    />
                    <span className="ml-2 text-gray-600">%</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Phase 1 supports 50/50 traffic split only
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Integration Instructions</h3>
            <p className="text-sm text-blue-700 mb-2">
              After creating your experiment, you'll need to integrate the SDK:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Install the ExperimentLab SDK in your application</li>
              <li>Use your project API key to initialize the SDK</li>
              <li>Call getVariant() to get the user's assignment</li>
              <li>Track conversions with the track() method</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/experiments')}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !formData.name}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Experiment'}
          </button>
        </div>
      </form>
    </div>
  );
}