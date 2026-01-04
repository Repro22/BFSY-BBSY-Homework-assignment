import { useCallback, useState } from "react";
import {useTranslation} from "react-i18next";

export function useError() {
    const {t} = useTranslation();
    const [error, setError] = useState(null);

    const clearError = useCallback(() => setError(null), []);

    const setFromException = useCallback((e) => {
        if (!e) return;
        const message = e.message || t("error.unexpectedError");
        const code = e.code || "";
        setError({ message, code, raw: e });
    }, []);

    return { error, setError, setFromException, clearError };
}
