import React, { useState, useEffect } from "react";

// Mock current user
const CURRENT_USER_ID = "user-1";
const INITIAL_LISTS = [
    {
        id: "list-1",
        name: "Saturday Groceries",
        isArchived: false,
        ownerId: "user-1", // current user is owner → can delete
    },
    {
        id: "list-2",
        name: "Party Supplies",
        isArchived: true,
        ownerId: "user-1", // archived, but still owned by current user
    },
    {
        id: "list-3",
        name: "DIY Projects",
        isArchived: false,
        ownerId: "user-2", // different owner → current user cannot delete
    },
];

export default function ShoppingListsOverview({ onOpenList }) {
    const [lists, setLists] = useState(INITIAL_LISTS);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState(null);
    const [includeArchived, setIncludeArchived] = useState(false);

    const handleOpenNewListModal = () => setIsNewModalOpen(true);
    const handleCloseNewListModal = () => setIsNewModalOpen(false);

    const handleCreateList = (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const newList = {
            id: "list-" + Date.now(),
            name: trimmed,
            isArchived: false, // new lists are non-archived by default
            ownerId: CURRENT_USER_ID, // created by current user
        };

        setLists((prev) => [...prev, newList]);
        setIsNewModalOpen(false);
    };

    const handleRequestDeleteList = (id) => {
        const list = lists.find((l) => l.id === id);
        if (!list) return;

        // only allow delete for owner
        if (list.ownerId !== CURRENT_USER_ID) {
            return;
        }

        setListToDelete(list);
    };

    const handleCancelDelete = () => setListToDelete(null);

    const handleConfirmDelete = () => {
        if (!listToDelete) return;
        setLists((prev) => prev.filter((l) => l.id !== listToDelete.id));
        setListToDelete(null);
    };

    const handleOpenList = (id) => {
        if (typeof onOpenList === "function") {
            onOpenList(id);
        }
    };

    const handleToggleIncludeArchived = () => {
        setIncludeArchived((prev) => !prev);
    };

    const visibleLists = includeArchived
        ? lists
        : lists.filter((l) => !l.isArchived);

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <ListsToolbar
                    onAddListClick={handleOpenNewListModal}
                    includeArchived={includeArchived}
                    onToggleIncludeArchived={handleToggleIncludeArchived}
                />
                <ListsGrid
                    lists={visibleLists}
                    onOpen={handleOpenList}
                    onDeleteRequest={handleRequestDeleteList}
                />
            </div>

            <NewListModal
                isOpen={isNewModalOpen}
                onClose={handleCloseNewListModal}
                onSubmit={handleCreateList}
            />

            <DeleteListDialog
                isOpen={!!listToDelete}
                listName={listToDelete?.name}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

function ListsToolbar({
                          onAddListClick,
                          includeArchived,
                          onToggleIncludeArchived,
                      }) {
    return (
        <div style={styles.toolbar}>
            <h1 style={styles.title}>Shopping Lists</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "0.85rem", display: "flex", gap: "4px" }}>
                    <input
                        type="checkbox"
                        checked={includeArchived}
                        onChange={onToggleIncludeArchived}
                    />
                    Include archived
                </label>
                <button type="button" style={styles.primaryButton} onClick={onAddListClick}>
                    + New list
                </button>
            </div>
        </div>
    );
}

function ListsGrid({ lists, onOpen, onDeleteRequest }) {
    if (!lists.length) {
        return (
            <p style={styles.emptyText}>
                No shopping lists to display with current filter.
            </p>
        );
    }

    return (
        <div style={styles.grid}>
            {lists.map((list) => (
                <ListCard
                    key={list.id}
                    id={list.id}
                    name={list.name}
                    isArchived={list.isArchived}
                    canDelete={list.ownerId === CURRENT_USER_ID}
                    onOpen={onOpen}
                    onDelete={onDeleteRequest}
                />
            ))}
        </div>
    );
}

function ListCard({ id, name, isArchived, canDelete, onOpen, onDelete }) {
    const handleOpen = () => onOpen(id);

    const handleDelete = (e) => {
        e.stopPropagation();
        if (!canDelete) return;
        onDelete(id);
    };

    return (
        <div
            onClick={handleOpen}
            style={styles.listCard}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
            }}
        >
            <div style={{ marginBottom: "8px" }}>
                <div style={styles.listHeader}>
                    <div style={styles.listName}>{name}</div>
                    {isArchived && <span style={styles.badge}>Archived</span>}
                </div>
                <div style={styles.listHint}>Click to open</div>
            </div>
            <div style={styles.listActions}>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canDelete}
                    style={{
                        ...styles.smallDangerButton,
                        opacity: canDelete ? 1 : 0.5,
                        cursor: canDelete ? "pointer" : "not-allowed",
                    }}
                >
                    {canDelete ? "Delete" : "Owner only"}
                </button>
            </div>
        </div>
    );
}

function NewListModal({ isOpen, onClose, onSubmit }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (!isOpen) setName("");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(name);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
            <div style={styles.modalCard}>
                <h2 style={{ marginTop: 0, marginBottom: "12px" }}>New shopping list</h2>
                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>
                        List name
                        <input
                            autoFocus
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Saturday Groceries"
                        />
                    </label>
                    <div style={styles.modalActions}>
                        <button
                            type="button"
                            style={styles.secondaryButton}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                ...styles.primaryButton,
                                opacity: name.trim() ? 1 : 0.6,
                                cursor: name.trim() ? "pointer" : "not-allowed",
                            }}
                            disabled={!name.trim()}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteListDialog({ isOpen, listName, onCancel, onConfirm }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onCancel();
    };

    return (
        <div style={styles.modalOverlay} onClick={handleOverlayClick}>
            <div style={styles.modalCard}>
                <h2 style={{ marginTop: 0, marginBottom: "8px" }}>
                    Delete shopping list
                </h2>
                <p style={{ marginBottom: "12px", fontSize: "0.95rem" }}>
                    Are you sure you want to delete{" "}
                    <strong>{listName || "this shopping list"}</strong>? This action
                    cannot be undone.
                </p>
                <div style={styles.modalActions}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        style={styles.dangerButton}
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
    },
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "800px",
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    title: {
        margin: 0,
        fontSize: "1.6rem",
    },
    primaryButton: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#2563eb",
        color: "#fff",
        fontSize: "0.9rem",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        cursor: "pointer",
        background: "#fff",
        fontSize: "0.9rem",
    },
    dangerButton: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#dc2626",
        color: "#fff",
        fontSize: "0.9rem",
    },
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#dc2626",
        color: "#fff",
        fontSize: "0.75rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
    },
    listCard: {
        borderRadius: "10px",
        border: "1px solid #e5e5e5",
        padding: "12px 14px",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "90px",
        cursor: "pointer",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
    },
    listHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
    },
    listName: {
        fontWeight: 600,
        fontSize: "1rem",
        wordBreak: "break-word",
    },
    listHint: {
        fontSize: "0.8rem",
        color: "#999",
    },
    listActions: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "8px",
    },
    emptyText: {
        fontStyle: "italic",
        color: "#777",
    },
    badge: {
        fontSize: "0.7rem",
        padding: "2px 6px",
        borderRadius: "999px",
        background: "#e5e7eb",
        color: "#374151",
    },
    modalOverlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalCard: {
        background: "#fff",
        padding: "20px 18px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    },
    label: {
        display: "block",
        fontSize: "0.9rem",
        marginBottom: "8px",
    },
    input: {
        marginTop: "4px",
        width: "95%",
        padding: "6px 6px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "0.95rem",
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
        marginTop: "12px",
    },
};
