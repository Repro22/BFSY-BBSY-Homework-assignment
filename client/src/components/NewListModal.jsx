import React from "react";
import {useTranslation} from "react-i18next";

export default function NewListModal({ isOpen, onClose, onSubmit, submitting = false }) {
    const {t} = useTranslation();
    const [name, setName] = React.useState("");

    React.useEffect(() => {
        if (!isOpen) setName("");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        await onSubmit(name);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const canSubmit = !!name.trim() && !submitting;

    return (
        <div style={styles.overlay} onClick={handleOverlayClick}>
            <div style={styles.card}>
                <h2 style={{ marginTop: 0, marginBottom: 12 }}>{t("dialogs.newListTitle")}</h2>

                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>
                        {t("dialogs.listNameLabel")}
                        <input
                            autoFocus
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("dialogs.listNamePlaceholder")}
                            disabled={submitting}
                        />
                    </label>

                    <div style={styles.actions}>
                        <button
                            type="button"
                            style={styles.secondaryButton}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            {t("header.cancel")}
                        </button>

                        <button
                            type="submit"
                            style={{
                                ...styles.primaryButton,
                                opacity: canSubmit ? 1 : 0.6,
                                cursor: canSubmit ? "pointer" : "not-allowed",
                            }}
                            disabled={!canSubmit}
                        >
                            {submitting ? t("dialogs.creating") : t("dialogs.create")}
                        </button>
                    </div>
                </form>
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
        maxWidth: 420,
    },
    label: {
        display: "block",
        fontSize: 14,
        marginBottom: 10,
    },
    input: {
        display: "block",
        width: "95%",
        marginTop: 6,
        padding: 6,
        borderRadius: 8,
        border: "1px solid var(--border)",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
    },
    primaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: "var(--primary)",
        color: "#fff",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        cursor: "pointer",
        background: "var(--card)",
        color: "var(--text)",
    },
};
