import React from "react";

export default function ItemsPanel({
                                       itemFilter,
                                       onChangeFilter,
                                       items,
                                       canInteract,
                                       onAddItem,
                                       onToggleResolved,
                                       onRemoveItem,

                                       addSubmitting = false,
                                       toggleSubmitting = () => false,
                                       removeSubmitting = () => false,
                                   }) {
    const [newItemName, setNewItemName] = React.useState("");
    const [newItemQty, setNewItemQty] = React.useState(1);

    const handleAdd = async () => {
        const trimmed = newItemName.trim();
        if (!trimmed || addSubmitting) return;

        await onAddItem({ name: trimmed, quantity: newItemQty });
        setNewItemName("");
        setNewItemQty(1);
    };

    return (
        <section style={styles.panel}>
            <h3 style={styles.panelTitle}>Items</h3>

            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 10 }}>
                <label style={styles.radioLabel}>
                    <input
                        type="radio"
                        checked={itemFilter === "unresolved"}
                        onChange={() => onChangeFilter("unresolved")}
                    />
                    Unresolved only
                </label>

                <label style={styles.radioLabel}>
                    <input
                        type="radio"
                        checked={itemFilter === "all"}
                        onChange={() => onChangeFilter("all")}
                    />
                    Include resolved
                </label>
            </div>

            {canInteract && (
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                        style={styles.input}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="New item"
                        disabled={addSubmitting}
                    />

                    <input
                        style={{ ...styles.input, width: 90 }}
                        type="number"
                        min={1}
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
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
                        disabled={addSubmitting || !newItemName.trim()}
                    >
                        {addSubmitting ? "Adding…" : "Add"}
                    </button>
                </div>
            )}

            <ul style={styles.list}>
                {(items || []).map((item) => {
                    const toggling = toggleSubmitting(item.id);
                    const removing = removeSubmitting(item.id);

                    return (
                        <li key={item.id} style={styles.listItem}>
              <span style={{ textDecoration: item.resolved ? "line-through" : "none" }}>
                {item.name} <span style={{ opacity: 0.7 }}>(x{item.quantity})</span>
              </span>

                            {canInteract && (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        style={{
                                            ...styles.smallButton,
                                            opacity: toggling ? 0.6 : 1,
                                            cursor: toggling ? "not-allowed" : "pointer",
                                        }}
                                        onClick={() => onToggleResolved(item)}
                                        disabled={toggling}
                                    >
                                        {toggling ? "Saving…" : item.resolved ? "Unresolve" : "Resolve"}
                                    </button>

                                    <button
                                        type="button"
                                        style={{
                                            ...styles.smallDangerButton,
                                            opacity: removing ? 0.6 : 1,
                                            cursor: removing ? "not-allowed" : "pointer",
                                        }}
                                        onClick={() => onRemoveItem(item.id)}
                                        disabled={removing}
                                    >
                                        {removing ? "Removing…" : "Remove"}
                                    </button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {(items || []).length === 0 && <div style={{ opacity: 0.7 }}>No items in this view.</div>}
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
    radioLabel: {
        display: "flex",
        gap: 6,
        alignItems: "center",
        fontSize: 13,
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
    smallButton: {
        padding: "4px 8px",
        borderRadius: 8,
        border: "1px solid #ccc",
        background: "#fff",
        fontSize: 12,
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
