import { Component, type ReactNode } from "react";
import { reportError } from "@/lib/monitoring";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    reportError(error, { componentStack: info.componentStack ?? undefined });
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold text-foreground">حدث خطأ غير متوقع</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            تم تسجيل المشكلة تلقائياً. يمكنك المحاولة مرة أخرى.
          </p>
          <button
            onClick={this.reset}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
}
