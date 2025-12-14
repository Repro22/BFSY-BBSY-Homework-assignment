import React from "react";

export default function DeleteListDialog({
                                             isOpen,
                                             listName,
                                             onCancel,
                                             onConfirm,
                                             submitting = false,
                                         }) {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onCancel();
    };

    return (
        <div style={styles.overlay} onClick={handleOverlayClick}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>Delete shopping list</h2>

                <p style={{ marginBottom: 12, fontSize: 14 }}>
                    Are you sure you want to delete <strong>{listName || "this list"}</strong>? This action
                    cannot be undone.
                </p>

                <div style={styles.actions}>
                    <button type="button" style={styles.secondaryButton} onClick={onCancel} disabled={submitting}>
                        Cancel
                    </button>

                    <button
                        type="button"
                        style={{
                            ...styles.dangerButton,
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                        onClick={onConfirm}
                        disabled={submitting}
                    >
                        {submitting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    card: {
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        maxWidth: 460,
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        cursor: "pointer",
        background: "#fff",
    },
    dangerButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        background: "#dc2626",
        color: "#fff",
    },
};
