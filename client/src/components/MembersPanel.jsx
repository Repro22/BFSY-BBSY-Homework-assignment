import React from "react";

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
    const [newMemberUserId, setNewMemberUserId] = React.useState("");

    const handleAdd = async () => {
        const trimmed = newMemberUserId.trim();
        if (!trimmed || addSubmitting) return;
        await onAddMember(trimmed);
        setNewMemberUserId("");
    };

    return (
        <section style={styles.panel}>
            <h3 style={styles.panelTitle}>Members</h3>

            <ul style={styles.list}>
                {(members || []).map((m) => {
                    const canRemoveThis = isOwner || m.id === currentUserId; // self removal allowed
                    const isOwnerMember = m.id === userMap[m.id];
                    const removing = removeSubmitting(m.id);

                    return (
                        <li key={m.id} style={styles.listItem}>
              <span>
                {userMap[m.id] ?? m.name ?? m.id}
                  {" "}
                  <span style={{ opacity: 0.7 }}>
                  ({m.role || (isOwnerMember ? "owner" : "member")})
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
                                    title={isOwnerMember ? "Owner cannot be removed" : ""}
                                >
                                    {removing ? "Removing…" : m.id === currentUserId ? "Leave" : "Remove"}
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
                        placeholder="User ID to add"
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
                        {addSubmitting ? "Adding…" : "Add"}
                    </button>
                </div>
            )}
        </section>
    );
}

const styles = {
    panel: {
        border: "1px solid #e5e5e5",
        borderRadius: 10,
        padding: 12,
        background: "#fafafa",
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
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "none",
        background: "#dc2626",
        color: "#fff",
        fontSize: 12,
    },
};
