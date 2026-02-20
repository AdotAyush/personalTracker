import { Component } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangleIcon className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-zinc-400 text-sm mb-6 max-w-md">
          {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="btn-primary"
        >
          <RefreshCwIcon className="w-4 h-4" />
          Try again
        </button>
        {import.meta.env.DEV && this.state.error && (
          <details className="mt-6 text-left w-full max-w-lg">
            <summary className="text-xs text-zinc-500 cursor-pointer">Stack trace</summary>
            <pre className="mt-2 text-xs text-red-400 bg-red-500/5 p-4 rounded-xl overflow-auto">
              {this.state.error.stack}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
