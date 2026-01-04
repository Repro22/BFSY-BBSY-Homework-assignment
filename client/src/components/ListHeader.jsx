import React from "react";
import { useTranslation } from "react-i18next";

export default function ListHeader({
                                       title,
                                       isArchived,
                                       loading,
                                       onBack,
                                       isOwner,
                                       isMember,
                                       currentUserId,
                                       ownerId,

                                       isEditing,
                                       nameDraft,
                                       onNameDraftChange,
                                       onStartRename,
                                       onCancelRename,
                                       onSaveRename,

                                       renameSubmitting = false,
                                   }) {

    const { t } = useTranslation();

    return (
        <div>
            <div style={styles.headerRow}>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {loading && <span style={{ fontSize: 12, opacity: 0.7 }}>{t("app.refreshing")}</span>}
                </div>
            </div>

            <div style={{ marginTop: 10 }}>
                {!isEditing ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h2 style={{ margin: 0 }}>{title}</h2>

                        {isOwner && (
                            <button
                                type="button"
                                style={{
                                    ...styles.smallButton,
                                    opacity: renameSubmitting ? 0.7 : 1,
                                    cursor: renameSubmitting ? "not-allowed" : "pointer",
                                }}
                                onClick={onStartRename}
                                disabled={renameSubmitting}
                            >
                                {t("header.rename")}
                            </button>
                        )}

                        {isArchived && <span style={styles.badge}>{t("header.archived")}</span>}
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                            style={styles.input}
                            value={nameDraft}
                            onChange={onNameDraftChange}
                            disabled={renameSubmitting}
                        />

                        <button
                            type="button"
                            style={{
                                ...styles.primaryButton,
                                opacity: renameSubmitting ? 0.7 : 1,
                                cursor: renameSubmitting ? "not-allowed" : "pointer",
                            }}
                            onClick={onSaveRename}
                            disabled={renameSubmitting}
                        >
                            {renameSubmitting ? "Saving…" : t("header.save")}
                        </button>

                        <button
                            type="button"
                            style={styles.secondaryButton}
                            onClick={onCancelRename}
                            disabled={renameSubmitting}
                        >
                            {t("header.cancel")}
                        </button>
                    </div>
                )}

                <div style={styles.meta}>
                    {t("header.roleOwner")} : <strong>{ownerId}</strong> • {t("header.roleMember")}: <strong>{currentUserId}</strong> •{" "}
                    {isOwner ? t("header.roleOwner") : isMember ? t("header.roleMember") : t("header.roleNotMember")}
                </div>
            </div>
        </div>
    );
}

const styles = {
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    meta: {
        marginTop: 6,
        fontSize: 12,
        opacity: 0.75,
    },
    badge: {
        fontSize: 12,
        background: "var(--bg)",
        padding: "2px 8px",
        borderRadius: 999,
        color: "#fff",
    },
    input: {
        padding: 8,
        borderRadius: 8,
        border: "1px solid #ccc",
        flex: 1,
    },
    primaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        background: "var(--primary)",
        color: "#fff",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--border-strong)",
        background: "var(--card)",
        color: "var(--text)",
        cursor: "pointer",
    },
    smallButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid var(--border-strong)",
        background: "var(--card)",
        color: "var(--text)",
        fontSize: 12,
    },
};
