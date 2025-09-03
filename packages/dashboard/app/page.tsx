import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              ExperimentLab
            </h1>
            <p className="text-xl text-gray-600">
              Developer-first experimentation platform for A/B testing and feature flags
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-gray-600 mb-6">
              Run experiments with confidence using our statistically rigorous platform.
            </p>
            <div className="flex gap-4">
              <Link
                href="/signin"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Quick Integration</h3>
              <p className="text-gray-600 text-sm">
                SDK integration in under 5 minutes with intuitive APIs
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 text-sm">
                Live results with statistical significance testing
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Statistical Rigor</h3>
              <p className="text-gray-600 text-sm">
                Enterprise-grade statistics with confidence intervals
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}