import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('backgroundImage');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-lg p-8 text-center space-y-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-foreground">Произошла ошибка</h1>
            <p className="text-muted-foreground">
              Не удалось загрузить приложение. Возможно, проблема с сохранённым фоном.
            </p>
            {this.state.error && (
              <details className="text-left text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium">Подробности ошибки</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center pt-4">
              <Button onClick={this.handleReset} variant="default">
                Сбросить и перезагрузить
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Просто перезагрузить
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
