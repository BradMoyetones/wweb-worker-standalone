// components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react"

type Props = {
    children: ReactNode;
    fallback?: ReactNode;
};

type State = {
    hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false
    }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <div>Ocurrió un error inesperado.</div>
        }

        return this.props.children
    }
}