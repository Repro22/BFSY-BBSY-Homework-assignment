import React from "react";
import { useTranslation } from "react-i18next";

export default function MembersPanel({
                                         members,
                                         userMap,
                                         currentUserId,
                                         isOwner,
                                         onAddMember,
                                         onRemoveMember,

                                         addSubmitting = false,
                                         removeSubmitting = () => false,
                                     }) {
    const { t } = useTranslation();
    const [newMemberUserId, setNewMemberUserId] = React.useState("");

    const handleAdd = async () => {
        const trimmed = newMemberUserId.trim();
        if (!trimmed || addSubmitting) return;
        await onAddMember(trimmed);
        setNewMemberUserId("");
    };

    return (
        <section style={styles.panel}>
            <h3 style={styles.panelTitle}>{t("members.title")}</h3>

            <ul style={styles.list}>
                {(members || []).map((m) => {
                    const canRemoveThis = isOwner || m.id === currentUserId; // self removal allowed
                    const isOwnerMember = m.role === "owner";
                    const removing = removeSubmitting(m.id);

                    return (
                        <li key={m.id} style={styles.listItem}>
              <span>
                {userMap[m.id] ?? m.name ?? m.id}
                  {" "}
                  <span style={{ opacity: 0.7 }}>
                  ({isOwnerMember ? t("header.roleOwner") : t("header.roleMember")})
                </span>
              </span>

                            {canRemoveThis && (
                                <button
                                    type="button"
                                    style={{
                                        ...styles.smallDangerButton,
                                        opacity: removing || isOwnerMember ? 0.6 : 1,
                                        cursor: removing || isOwnerMember ? "not-allowed" : "pointer",
                                    }}
                                    onClick={() => onRemoveMember(m.id)}
                                    disabled={removing || isOwnerMember}
                                    title={isOwnerMember ? t("members.ownerCannotBeRemoved") : ""}
                                >
                                    {removing ? t("members.removing") : m.id === currentUserId ? t("members.leave") : t("members.remove")}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            {isOwner && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                        style={styles.input}
                        value={newMemberUserId}
                        onChange={(e) => setNewMemberUserId(e.target.value)}
                        placeholder={t("members.userIdPlaceholder")}
                        disabled={addSubmitting}
                    />
                    <button
                        type="button"
                        style={{
                            ...styles.primaryButton,
                            opacity: addSubmitting ? 0.7 : 1,
                            cursor: addSubmitting ? "not-allowed" : "pointer",
                        }}
                        onClick={handleAdd}
                        disabled={addSubmitting || !newMemberUserId.trim()}
                    >
                        {addSubmitting ? t("members.adding") : t("members.add")}
                    </button>
                </div>
            )}
        </section>
    );
}

const styles = {
    panel: {
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 12,
        background: "var(--panel)",
    },
    panelTitle: {
        marginTop: 0,
        marginBottom: 10,
    },
    list: {
        margin: 0,
        paddingLeft: 18,
    },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    input: {
        padding: 8,
        borderRadius: 8,
        border: "1px solid var(--border)",
        flex: 1,
    },
    primaryButton: {
        padding: "6px 12px",
        borderRadius: 8,
        border: "none",
        background: "var(--primary)",
        color: "#fff",
    },
    smallButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid var(--border-strong)",
        background: "var(--card)",
        color: "var(--text)",
        fontSize: 12,
    },
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "none",
        background: "var(--danger)",
        color: "#fff",
        fontSize: 12,
    },
};
