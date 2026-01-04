import React, { useEffect, useState } from "react";
import ShoppingListsOverview from "./pages/ShoppingListsOverview.jsx";
import ListDetailPage from "./pages/ListDetailPage.jsx";
import { useTheme } from "./hooks/useTheme";
import { useLanguage } from "./hooks/useLanguage";

function parseHash() {
    const raw = (window.location.hash || "").replace(/^#/, "");
    const parts = raw.split("/").filter(Boolean);

    if (parts.length >= 2 && (parts[0] === "lists" || parts[0] === "list")) {
        return parts[1];
    }
    if (parts.length === 1 && parts[0]) return parts[0];
    return null;
}

function setHashForList(listId) {
    if (!listId) {
        window.location.hash = "";
    } else {
        window.location.hash = `#/lists/${listId}`;
    }
}

export default function FrontendApp() {
    const [selectedListId, setSelectedListId] = useState(() => parseHash());
    const { theme, setTheme } = useTheme();
    const { language, setLanguage } = useLanguage();

    useEffect(() => {
        const onChange = () => setSelectedListId(parseHash());
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);

    const handleOpenList = (id) => {
        setSelectedListId(id);
        setHashForList(id);
    };

    const handleBackToOverview = () => {
        setSelectedListId(null);
        setHashForList(null);
    };

       return selectedListId ? (
        <ListDetailPage
            listId={selectedListId}
            onBack={handleBackToOverview}
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
        />
    ) : (
        <ShoppingListsOverview
            onOpenList={handleOpenList}
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
        />
    );
}