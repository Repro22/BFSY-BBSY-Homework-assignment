import React from "react";

export default function ErrorBanner({ error, onDismiss }) {
    if (!error) return null;

    return (
        <div style={styles.wrap}>
            <div>
                <div style={styles.title}>Something went wrong</div>
                <div style={styles.msg}>{error.message}</div>
                {error.code && <div style={styles.code}>code: {error.code}</div>}
            </div>
            <button type="button" style={styles.button} onClick={onDismiss}>
                Dismiss
            </button>
        </div>
    );
}

const styles = {
    wrap: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        padding: 12,
        marginTop: 12,
        borderRadius: 10,
        background: "#fee2e2",
        border: "1px solid #fecaca",
    },
    title: {
        fontWeight: 700,
        marginBottom: 4,
    },
    msg: {
        fontSize: 14,
    },
    code: {
        fontSize: 12,
        opacity: 0.8,
        marginTop: 6,
    },
    button: {
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #ef4444",
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
    },
};
