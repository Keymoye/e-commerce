'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to Sentry (once integrated)
    // Sentry.captureException(error);
    console.error('[Global Error Boundary]', error);
  }, [error]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-6 p-8'>
      <div className='text-center max-w-md'>
        <h1 className='text-2xl font-bold text-foreground mb-2'>
          Something went wrong
        </h1>
        <p className='text-muted-foreground mb-6'>
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className='flex gap-3 justify-center'>
          <Button onClick={reset}>Try Again</Button>
          <Button variant='outline' onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
