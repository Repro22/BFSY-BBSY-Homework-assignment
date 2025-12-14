import React from "react";

export default function NewListModal({ isOpen, onClose, onSubmit, submitting = false }) {
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
                <h2 style={{ marginTop: 0, marginBottom: 12 }}>New shopping list</h2>

                <form onSubmit={handleSubmit}>
                    <label style={styles.label}>
                        List name
                        <input
                            autoFocus
                            style={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Saturday groceries"
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
                            Cancel
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
                            {submitting ? "Creating…" : "Create"}
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
        background: "#fff",
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
        width: "100%",
        marginTop: 6,
        padding: 8,
        borderRadius: 8,
        border: "1px solid #ccc",
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
        background: "#2563eb",
        color: "#fff",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        cursor: "pointer",
        background: "#fff",
    },
};
