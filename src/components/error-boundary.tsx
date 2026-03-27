"use client";

import { Component } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="text-3xl mb-3 opacity-30">!</div>
          <p className="text-sm text-white/50 mb-1">
            페이지를 불러오는 중 오류가 발생했습니다
          </p>
          <p className="text-xs text-white/25 mb-4">
            새로고침하거나 아래 버튼을 눌러주세요
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/50 hover:bg-white/10 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
