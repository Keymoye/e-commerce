'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
  onError?:  (error: Error, info: ErrorInfo) => void;
}
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // Sentry.captureException(error, { extra: info });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4'>
          <p className='text-sm text-destructive font-medium'>
            This section failed to load. Please refresh.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
