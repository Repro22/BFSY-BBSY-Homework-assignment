import React, { useEffect, useState, useMemo } from "react";
import { CURRENT_USER_ID } from "../config/currentUser";
import { useShoppingListDetail } from "../hooks/useShoppingListDetail";
import { useUsers } from "../hooks/useUsers";
import { useBusy } from "../hooks/useBusy";
import { useError } from "../hooks/useError";
import { useTranslation } from "react-i18next";

import ErrorBanner from "../components/ErrorBanner";
import ListHeader from "../components/ListHeader";
import MembersPanel from "../components/MembersPanel";
import ItemsPanel from "../components/ItemsPanel";
import ItemStatusPieChart from "../components/charts/ItemStatusPieChart.jsx";
import AppControls from "../components/AppControls.jsx";

export default function ListDetailPage({
                                           listId,
                                           onBack,
                                           theme,
                                           setTheme,
                                           language,
                                           setLanguage,
                                       }) {

    const {
        list,
        loading,
        itemFilter,
        setItemFilter,
        visibleItems,
        isOwner,
        isMember,
        canInteract,
        renameList,
        addMember,
        removeMember,
        addItem,
        toggleResolved,
        removeItem,
    } = useShoppingListDetail(listId);

    const { t } = useTranslation();
    const { isBusy, run } = useBusy();
    const { error, setFromException, clearError } = useError();
    const userMap = useUsers();
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");

    useEffect(() => {
        if (list?.name) {
            setNameDraft(list.name);
            setIsEditingName(false);
        }
    }, [list?.name]);

    if (loading && !list) {
        return <div style={styles.page}>{t("app.loading")}</div>;
    }

    if (!list) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={{ marginBottom: 10 }}>
                        <button type="button" style={styles.secondaryButton} onClick={onBack}>
                            ← Back
                        </button>
                    </div>
                    <div style={{ opacity: 0.8 }}>{t("detail.notFound")}</div>
                </div>
            </div>
        );
    }

    const startRename = () => {
        if (!isOwner) return;
        setNameDraft(list.name);
        setIsEditingName(true);
    };

    const cancelRename = () => {
        setNameDraft(list.name);
        setIsEditingName(false);
    };

    const saveRename = async () => {
        try {
            await run("renameList", () => renameList(nameDraft));
            setIsEditingName(false);
        } catch (e) {
            setFromException(e);
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await run("addMember", () => addMember(userId));
        } catch (e) {
            setFromException(e);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await run(`removeMember:${userId}`, () => removeMember(userId));
        } catch (e) {
            setFromException(e);
        }
    };

    const handleAddItem = async ({ name, quantity }) => {
        try {
            await run("addItem", () => addItem({ name, quantity }));
        } catch (e) {
            setFromException(e);
        }
    };

    const handleToggleResolved = async (item) => {
        try {
            await run(`toggleResolved:${item.id}`, () => toggleResolved(item));
        } catch (e) {
            setFromException(e);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await run(`removeItem:${itemId}`, () => removeItem(itemId));
        } catch (e) {
            setFromException(e);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                <div style={styles.topBar}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button type="button" style={styles.secondaryButton} onClick={onBack}>
                            ← {t("app.back")}
                        </button>

                        <h1 style={styles.title}>{t("detail.listDetail")}</h1>
                    </div>

                    <AppControls
                        theme={theme}
                        onThemeChange={setTheme}
                        language={language}
                        onLanguageChange={setLanguage}
                    />
                </div>

                <ListHeader
                    title={list.name}
                    isArchived={list.isArchived}
                    loading={loading}
                    onBack={onBack}
                    isOwner={isOwner}
                    isMember={isMember}
                    currentUserId={CURRENT_USER_ID}
                    ownerId={list.ownerId}
                    isEditing={isEditingName}
                    nameDraft={nameDraft}
                    onNameDraftChange={(e) => setNameDraft(e.target.value)}
                    onStartRename={startRename}
                    onCancelRename={cancelRename}
                    onSaveRename={saveRename}
                    renameSubmitting={isBusy("renameList")}
                />

                <ErrorBanner error={error} onDismiss={clearError} />

                {!canInteract && (
                    <div style={styles.warning}>
                        {t("detail.notMemberWarning")}
                    </div>
                )}

                <div style={styles.grid}>

                    <MembersPanel
                        members={list.members}
                        userMap={userMap}
                        currentUserId={CURRENT_USER_ID}
                        isOwner={isOwner}
                        onAddMember={handleAddMember}
                        onRemoveMember={handleRemoveMember}
                        addSubmitting={isBusy("addMember")}
                        removeSubmitting={(id) => isBusy(`removeMember:${id}`)}
                    />

                    <ItemsPanel
                        itemFilter={itemFilter}
                        onChangeFilter={setItemFilter}
                        items={visibleItems}
                        canInteract={canInteract}
                        onAddItem={handleAddItem}
                        onToggleResolved={handleToggleResolved}
                        onRemoveItem={handleRemoveItem}
                        addSubmitting={isBusy("addItem")}
                        toggleSubmitting={(id) => isBusy(`toggleResolved:${id}`)}
                        removeSubmitting={(id) => isBusy(`removeItem:${id}`)}
                    />
                </div>

                <div style={styles.grid}>
                    <ItemStatusPieChart items={list.items}/>
                </div>
            </div>
        </div>
    );
}

const styles = {
    title: {
        margin: 0,
        fontSize: 20,
        lineHeight: 1.2,
    },
    page: {
        minHeight: "100vh",
        background: "var(--bg)",
        padding: 24,
        display: "flex",
        justifyContent: "center",
    },
    card: {
        background: "var(--card)",
        borderRadius: 12,
        padding: 18,
        maxWidth: 980,
        width: "100%",
        boxShadow: "var(--shadow)",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginTop: 16,
    },
    warning: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        background: "var(--warning-bg)",
        border: "1px solid var(--warning-border)",
        color: "var(--text)",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid var(--border-strong)",
        background: "var(--card)",
        color: "var(--text)",
        cursor: "pointer",
    },
    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 10,
    },
};