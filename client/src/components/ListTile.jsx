import React from "react";
import {useTranslation} from "react-i18next";

export default function ListTile({ list, canOwnerActions, onOpen, onArchiveToggle, onDelete }) {
    const {t} = useTranslation();
    const handleOpen = () => onOpen(list.id);

    const handleArchive = (e) => {
        e.stopPropagation();
        if (!canOwnerActions) return;
        onArchiveToggle(list.id, list.isArchived)
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
                    {list.isArchived && <span style={styles.badge}>{t("listTile.archived")}</span>}
                </div>
                <div style={styles.hint}>
                    {t("listTile.items")}: {list.itemsCount} • {t("listTile.unresolved")}: {list.unresolvedItemsCount}
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
                    {list.isArchived ? t("listTile.unarchive") : t("listTile.archive")}
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
                    {canOwnerActions ? t("listTile.delete") : t("listTile.ownerOnly")}
                </button>
            </div>
        </div>
    );
}

const styles = {
    card: {
        borderRadius: 10,
        border: "1px solid var(--border)",
        padding: "12px 14px",
        background: "var(--panel)",
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
        background: "var(--bg)",
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
        border: "1px solid var(--border-strong)",
        background: "var(--card)",
        color: "var(--text)",
        fontSize: 12,
    },
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "none",
        background: "var(--danger)",
        color: "#fff",
        fontSize: 12,
    },
};
