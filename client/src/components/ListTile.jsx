import React from "react";

export default function ListTile({ list, canOwnerActions, onOpen, onArchiveToggle, onDelete }) {
    const handleOpen = () => onOpen(list.id);

    const handleArchive = (e) => {
        e.stopPropagation();
        if (!canOwnerActions) return;
        onArchiveToggle(list);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (!canOwnerActions) return;
        onDelete(list.id);
    };

    return (
        <div
            onClick={handleOpen}
            style={styles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
            }}
        >
            <div style={{ marginBottom: 8 }}>
                <div style={styles.header}>
                    <div style={styles.name}>{list.name}</div>
                    {list.isArchived && <span style={styles.badge}>Archived</span>}
                </div>
                <div style={styles.hint}>
                    Items: {list.itemsCount} • Unresolved: {list.unresolvedItemsCount}
                </div>
            </div>

            <div style={styles.actions}>
                <button
                    type="button"
                    onClick={handleArchive}
                    disabled={!canOwnerActions}
                    style={{
                        ...styles.smallButton,
                        opacity: canOwnerActions ? 1 : 0.5,
                        cursor: canOwnerActions ? "pointer" : "not-allowed",
                    }}
                >
                    {list.isArchived ? "Unarchive" : "Archive"}
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!canOwnerActions}
                    style={{
                        ...styles.smallDangerButton,
                        opacity: canOwnerActions ? 1 : 0.5,
                        cursor: canOwnerActions ? "pointer" : "not-allowed",
                    }}
                >
                    {canOwnerActions ? "Delete" : "Owner only"}
                </button>
            </div>
        </div>
    );
}

const styles = {
    card: {
        borderRadius: 10,
        border: "1px solid #e5e5e5",
        padding: "12px 14px",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 120ms ease",
        cursor: "pointer",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    name: {
        fontWeight: 600,
    },
    badge: {
        fontSize: 12,
        background: "#eee",
        padding: "2px 8px",
        borderRadius: 999,
    },
    hint: {
        fontSize: 12,
        opacity: 0.75,
        marginTop: 6,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 8,
    },
    smallButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "#fff",
        fontSize: 12,
    },
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "none",
        background: "#dc2626",
        color: "#fff",
        fontSize: 12,
    },
};
