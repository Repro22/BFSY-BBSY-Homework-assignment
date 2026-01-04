import React from "react";
import {useTranslation} from "react-i18next";

export default function ErrorBanner({ error, onDismiss }) {
    if (!error) return null;
    const { t } = useTranslation();
    return (
        <div style={styles.wrap}>
            <div>
                <div style={styles.title}>{t("error.something")}</div>
                <div style={styles.msg}>{error.message}</div>
                {error.code && <div style={styles.code}>code: {error.code}</div>}
            </div>
            <button type="button" style={styles.button} onClick={onDismiss}>
                {t("error.dismiss")}
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
        background: "#F25F5C",
        border: "1px solid var(--border)",
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
        border: "1px solid var(--border)",
        background: "#fff",
        cursor: "pointer",
        fontSize: 12,
    },
};
