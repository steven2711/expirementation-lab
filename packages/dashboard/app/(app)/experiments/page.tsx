'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../../../lib/api';

export default function ExperimentsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'draft' | 'running' | 'stopped'>('all');

  const { data: experiments, isLoading } = useQuery({
    queryKey: ['experiments', filter],
    queryFn: async () => {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/api/experiments${params}`);
      return response.data.data;
    },
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/experiments/${id}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/experiments/${id}/stop`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'stopped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your A/B tests
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/experiments/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Experiment
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['all', 'draft', 'running', 'stopped'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === status
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Experiments List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : experiments?.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {experiments.map((experiment: any) => (
              <li key={experiment.id} className="hover:bg-gray-50">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/experiments/${experiment.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {experiment.name}
                      </Link>
                      {experiment.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {experiment.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mr-3 ${getStatusColor(experiment.status)}`}>
                          {experiment.status}
                        </span>
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Created {formatDistanceToNow(new Date(experiment.createdAt), { addSuffix: true })}
                        {experiment.startedAt && (
                          <>
                            <span className="mx-2">•</span>
                            Started {formatDistanceToNow(new Date(experiment.startedAt), { addSuffix: true })}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-3">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium text-gray-900">
                          {experiment._count?.events || 0}
                        </div>
                        <div className="text-xs text-gray-500">events</div>
                      </div>
                      {experiment.status === 'draft' && (
                        <button
                          onClick={() => startMutation.mutate(experiment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Start
                        </button>
                      )}
                      {experiment.status === 'running' && (
                        <button
                          onClick={() => stopMutation.mutate(experiment.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                        >
                          Stop
                        </button>
                      )}
                      <Link
                        href={`/experiments/${experiment.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No experiments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first experiment
          </p>
          <div className="mt-6">
            <Link
              href="/experiments/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Experiment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}