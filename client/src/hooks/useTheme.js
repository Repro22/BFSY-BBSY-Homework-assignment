import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") return saved;

        const prefersDark =
            typeof window !== "undefined" &&
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        return prefersDark ? "dark" : "light";
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, theme);
        applyTheme(theme);
    }, [theme]);

    return { theme, setTheme };
}
