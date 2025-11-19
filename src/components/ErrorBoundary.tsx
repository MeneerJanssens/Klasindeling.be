import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log the error to an external service here
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl text-left">
            <h2 className="text-xl font-bold text-red-700 mb-2">Er is iets misgegaan</h2>
            <p className="text-sm text-gray-700 mb-4">Een fout is opgetreden tijdens het laden van deze pagina. Bekijk de console voor details.</p>
            <details className="text-xs text-gray-600">
              <summary className="cursor-pointer">Toon foutdetails</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}\n{this.state.info?.componentStack}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
