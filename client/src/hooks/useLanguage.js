import { useEffect, useState } from "react";
import i18n from "../i18n";

const STORAGE_KEY = "lang";
const SUPPORTED = ["en", "cs", "sk"];

export function useLanguage() {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return SUPPORTED.includes(saved) ? saved : "en";
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
        i18n.changeLanguage(language);
    }, [language]);

    return { language, setLanguage, supported: SUPPORTED };
}
