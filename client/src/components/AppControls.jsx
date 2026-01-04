import React from "react";
import { useTranslation } from "react-i18next";

export default function AppControls({
                                        theme,
                                        onThemeChange,
                                        language,
                                        onLanguageChange,
                                    }) {
    const { t } = useTranslation();

    return (
        <div style={styles.container}>
            <label style={styles.control}>
                <span>{t("controls.theme")}</span>
                <select
                    value={theme}
                    onChange={(e) => onThemeChange(e.target.value)}
                >
                    <option value="light">{t("controls.light")}</option>
                    <option value="dark">{t("controls.dark")}</option>
                </select>
            </label>

            <label style={styles.control}>
                <span>{t("controls.language")}</span>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                >
                    <option value="en">EN</option>
                    <option value="cs">CS</option>
                    <option value="sk">SK</option>
                </select>
            </label>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
    },
    control: {
        display: "flex",
        gap: 6,
        alignItems: "center",
        fontSize: 13,
    },
};
