'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { api } from '../../../../lib/api';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function ExperimentDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const experimentId = params.id as string;

  const { data: experiment } = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: async () => {
      const response = await api.get(`/api/experiments/${experimentId}`);
      return response.data.data;
    },
  });

  const { data: results } = useQuery({
    queryKey: ['experiment-results', experimentId],
    queryFn: async () => {
      const response = await api.get(`/api/experiments/${experimentId}/results`);
      return response.data.data;
    },
    refetchInterval: experiment?.status === 'running' ? 30000 : false, // Refetch every 30s if running
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/experiments/${experimentId}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', experimentId] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/experiments/${experimentId}/stop`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiment', experimentId] });
    },
  });

  if (!experiment || !results) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const conversionData = [
    {
      name: 'Control',
      visitors: results.control.visitors,
      conversions: results.control.conversions,
      rate: (results.control.conversionRate * 100).toFixed(2),
    },
    {
      name: 'Variant',
      visitors: results.variant.visitors,
      conversions: results.variant.conversions,
      rate: (results.variant.conversionRate * 100).toFixed(2),
    },
  ];

  const improvement = results.variant.conversionRate > 0 
    ? ((results.variant.conversionRate - results.control.conversionRate) / results.control.conversionRate * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{experiment.name}</h1>
            {experiment.description && (
              <p className="mt-1 text-gray-600">{experiment.description}</p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                experiment.status === 'running' 
                  ? 'bg-green-100 text-green-800'
                  : experiment.status === 'draft'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {experiment.status}
              </span>
              <span>
                Created {formatDistanceToNow(new Date(experiment.createdAt), { addSuffix: true })}
              </span>
              {experiment.startedAt && (
                <span>
                  Started {formatDistanceToNow(new Date(experiment.startedAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {experiment.status === 'draft' && (
              <button
                onClick={() => startMutation.mutate()}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Start Experiment
              </button>
            )}
            {experiment.status === 'running' && (
              <button
                onClick={() => stopMutation.mutate()}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700"
              >
                Stop Experiment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Visitors
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {results.control.visitors + results.variant.visitors}
            </dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Conversions
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {results.control.conversions + results.variant.conversions}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Improvement
            </dt>
            <dd className={`mt-1 text-3xl font-semibold ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Statistical Significance
            </dt>
            <dd className="mt-1">
              {results.statisticalSignificance ? (
                <span className="text-green-600 font-semibold">Yes ✓</span>
              ) : (
                <span className="text-gray-400">Not yet</span>
              )}
              <p className="text-xs text-gray-500 mt-1">
                p-value: {results.pValue.toFixed(4)}
              </p>
            </dd>
          </div>
        </div>
      </div>

      {/* Results Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="rate" fill="#3B82F6" name="Conversion Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visitors" fill="#8B5CF6" name="Visitors" />
              <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence Interval
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="font-medium">Control</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {results.control.visitors}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {results.control.conversions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(results.control.conversionRate * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  [{(results.control.confidenceInterval.lower * 100).toFixed(2)}%, 
                   {(results.control.confidenceInterval.upper * 100).toFixed(2)}%]
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="font-medium">Variant</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {results.variant.visitors}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {results.variant.conversions}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(results.variant.conversionRate * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  [{(results.variant.confidenceInterval.lower * 100).toFixed(2)}%, 
                   {(results.variant.confidenceInterval.upper * 100).toFixed(2)}%]
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Size Recommendation */}
      {!results.statisticalSignificance && results.sampleSizeRecommendation > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Sample Size Recommendation</h4>
          <p className="text-sm text-blue-700">
            You need approximately {results.sampleSizeRecommendation.toLocaleString()} visitors per variant
            to reach statistical significance at the current conversion rates.
          </p>
        </div>
      )}
    </div>
  );
}