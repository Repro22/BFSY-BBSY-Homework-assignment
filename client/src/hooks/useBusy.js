import { useCallback, useState } from "react";

export function useBusy() {
    const [busySet, setBusySet] = useState(() => new Set());

    const isBusy = useCallback((key) => busySet.has(key), [busySet]);

    const run = useCallback(async (key, fn) => {
        setBusySet((prev) => {
            const next = new Set(prev);
            next.add(key);
            return next;
        });

        try {
            return await fn();
        } finally {
            setBusySet((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    }, []);

    return { isBusy, run };
}
