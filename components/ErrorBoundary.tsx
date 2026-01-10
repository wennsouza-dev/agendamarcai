import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Ops! Algo deu errado.</h1>
                    <p className="text-gray-700 mb-4">
                        Ocorreu um erro inesperado. Por favor, recarregue a página.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Recarregar Página
                    </button>
                    {this.state.error && (
                        <details className="mt-4 p-2 bg-white rounded shadow text-left text-xs text-gray-500 overflow-auto max-w-full">
                            <summary className="cursor-pointer mb-2">Detalhes do erro</summary>
                            <pre>{this.state.error.toString()}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
