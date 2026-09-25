import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Uncaught error in component tree", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center"
          role="alert"
        >
          <h1 className="text-2xl font-bold">
            Something went wrong — please reload
          </h1>
        </div>
      );
    }
    return this.props.children;
  }
}
