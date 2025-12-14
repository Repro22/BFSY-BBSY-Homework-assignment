import { useCallback, useState } from "react";


export function useError() {
    const [error, setError] = useState(null);

    const clearError = useCallback(() => setError(null), []);

    const setFromException = useCallback((e) => {
        if (!e) return;
        const message = e.message || "Unexpected error";
        const code = e.code || "unexpectedError";
        setError({ message, code, raw: e });
    }, []);

    return { error, setError, setFromException, clearError };
}
