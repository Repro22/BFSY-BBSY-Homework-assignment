import React from "react";

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
    return (
        <div>
            <div style={styles.headerRow}>
                <button type="button" style={styles.secondaryButton} onClick={onBack}>
                    ← Back
                </button>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {loading && <span style={{ fontSize: 12, opacity: 0.7 }}>Refreshing…</span>}
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
                                Rename
                            </button>
                        )}

                        {isArchived && <span style={styles.badge}>Archived</span>}
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
                            {renameSubmitting ? "Saving…" : "Save"}
                        </button>

                        <button
                            type="button"
                            style={styles.secondaryButton}
                            onClick={onCancelRename}
                            disabled={renameSubmitting}
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div style={styles.meta}>
                    Owner: <strong>{ownerId}</strong> • You: <strong>{currentUserId}</strong> •{" "}
                    {isOwner ? "Owner" : isMember ? "Member" : "Not a member"}
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
        background: "#eee",
        padding: "2px 8px",
        borderRadius: 999,
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
        background: "#2563eb",
        color: "#fff",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
    },
    smallButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "#fff",
        fontSize: 12,
    },
};
