import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private readonly handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            Quelque chose ne s'est pas passe comme prevu. Veuillez recharger la page.
          </p>
          <Button onClick={this.handleReload} className="mt-6" size="lg">
            Recharger
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
