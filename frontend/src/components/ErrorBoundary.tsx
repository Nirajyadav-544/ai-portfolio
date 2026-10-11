import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="container-page py-28 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="muted mt-2">An unexpected error occurred. Reloading usually fixes it.</p>
        <button className="btn-primary mt-6" onClick={() => window.location.reload()}>Reload page</button>
      </div>
    );
  }
}
