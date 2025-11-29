import React, { useState } from "react";
import ShoppingListsOverview from "./ShoppingListsOverview";
import ListDetailPage from "./ListDetailPage";

export default function FrontendApp() {
    const [selectedListId, setSelectedListId] = useState(null);

    const handleOpenList = (id) => {
        // For now, any list opens the same detail page
        setSelectedListId(id);
    };

    const handleBackToOverview = () => {
        setSelectedListId(null);
    };

    if (selectedListId) {
        return (
            <div>
                <div style={{ padding: "12px 16px", background: "#f5f5f5" }}>
                    <button
                        type="button"
                        onClick={handleBackToOverview}
                        style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            background: "#fff",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                        }}
                    >
                        ← Back to lists
                    </button>
                </div>
                <ListDetailPage />
            </div>
        );
    }

    return <ShoppingListsOverview onOpenList={handleOpenList} />;
}
