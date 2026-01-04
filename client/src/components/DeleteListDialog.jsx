import React from "react";
import { useTranslation} from "react-i18next";

export default function DeleteListDialog({
                                             isOpen,
                                             listName,
                                             onCancel,
                                             onConfirm,
                                             submitting = false,
                                         }) {
    if (!isOpen) return null;
    const { t } = useTranslation();
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onCancel();
    };

    return (
        <div style={styles.overlay} onClick={handleOverlayClick}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>{t("dialogs.deleteTitle")}</h2>

                <p style={{ marginBottom: 12, fontSize: 14 }}>
                    {t("dialogs.deleteQuestion", { name: listName })}
                </p>

                <div style={styles.actions}>
                    <button type="button" style={styles.secondaryButton} onClick={onCancel} disabled={submitting}>
                        {t("header.cancel")}
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
                        {submitting ? t("dialogs.deleting") : t("listTile.delete")}
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
        background: "var(--card)",
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
        border: "1px solid var(--border-strong)",
        cursor: "pointer",
        background: "var(--card)",
        color: "var(--text)",
    },
    dangerButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        background: "var(--danger)",
        color: "#fff",
    },
};
