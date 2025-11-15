import React, { useState } from "react";

const CURRENT_USER_ID = "u1";

const INITIAL_LIST = {
    id: "list-1",
    name: "Saturday Groceries",
    ownerId: "u1",
    members: [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
        { id: "u3", name: "Charlie" },
    ],
    items: [
        { id: "i1", name: "Milk", resolved: false, quantity: 1 },
        { id: "i2", name: "Bread", resolved: false, quantity: 2 },
        { id: "i3", name: "Coffee", resolved: true, quantity: 1 },
    ],
};

export default function ListDetailPage() {
    const [list, setList] = useState(INITIAL_LIST);
    const [itemFilter, setItemFilter] = useState("unresolved"); // "unresolved" | "all"
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(INITIAL_LIST.name);
    const [newMemberName, setNewMemberName] = useState("");
    const [newItemName, setNewItemName] = useState("");

    const isOwner = list.ownerId === CURRENT_USER_ID;
    const currentUserIsMember = list.members.some(
        (m) => m.id === CURRENT_USER_ID
    );

    // List name

    const handleSaveName = () => {
        const trimmed = nameDraft.trim();
        if (!trimmed) return;
        setList((prev) => ({ ...prev, name: trimmed }));
        setIsEditingName(false);
    };

    const handleCancelNameEdit = () => {
        setNameDraft(list.name);
        setIsEditingName(false);
    };

    // Members

    const handleAddMember = (e) => {
        e.preventDefault();
        const trimmed = newMemberName.trim();
        if (!trimmed) return;

        const newMember = {
            id: "u-" + Date.now(),
            name: trimmed,
        };

        setList((prev) => ({
            ...prev,
            members: [...prev.members, newMember],
        }));
        setNewMemberName("");
    };

    const handleRemoveMember = (memberId) => {
        setList((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== memberId),
        }));
    };

    const handleLeaveList = () => {
        if (isOwner) return; // owner can't leave in this simple model
        setList((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m.id !== CURRENT_USER_ID),
        }));
    };

    // Items: add / remove / resolved

    const handleAddItem = (e) => {
        e.preventDefault();
        const trimmed = newItemName.trim();
        if (!trimmed) return;

        const newItem = {
            id: "i-" + Date.now(),
            name: trimmed,
            resolved: false,
            quantity: 1,
        };

        setList((prev) => ({
            ...prev,
            items: [...prev.items, newItem],
        }));
        setNewItemName("");
    };

    const handleRemoveItem = (itemId) => {
        setList((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    };

    const handleToggleResolved = (itemId) => {
        setList((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId
                    ? { ...item, resolved: !item.resolved }
                    : item
            ),
        }));
    };

    // Items: quantity

    const handleChangeQuantity = (itemId, delta) => {
        setList((prev) => ({
            ...prev,
            items: prev.items.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity + delta),
                    }
                    : item
            ),
        }));
    };

    const handleIncreaseQuantity = (itemId) =>
        handleChangeQuantity(itemId, 1);

    const handleDecreaseQuantity = (itemId) =>
        handleChangeQuantity(itemId, -1);

    // Filtering

    const filteredItems =
        itemFilter === "unresolved"
            ? list.items.filter((item) => !item.resolved)
            : list.items;

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <ListHeader
                    list={list}
                    isOwner={isOwner}
                    currentUserIsMember={currentUserIsMember}
                    isEditingName={isEditingName}
                    nameDraft={nameDraft}
                    setNameDraft={setNameDraft}
                    onStartEditName={() => setIsEditingName(true)}
                    onSaveName={handleSaveName}
                    onCancelNameEdit={handleCancelNameEdit}
                    newMemberName={newMemberName}
                    setNewMemberName={setNewMemberName}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                    onLeaveList={handleLeaveList}
                />

                <section style={{ marginTop: "24px" }}>
                    <ItemsToolbar
                        filter={itemFilter}
                        onChangeFilter={setItemFilter}
                    />

                    <ItemsList
                        items={filteredItems}
                        onToggleResolved={handleToggleResolved}
                        onRemoveItem={handleRemoveItem}
                        onIncreaseQuantity={handleIncreaseQuantity}
                        onDecreaseQuantity={handleDecreaseQuantity}
                    />

                    <NewItemForm
                        newItemName={newItemName}
                        setNewItemName={setNewItemName}
                        onAddItem={handleAddItem}
                    />
                </section>
            </div>
        </div>
    );
}

// Components

function ListHeader({
                           list,
                           isOwner,
                           currentUserIsMember,
                           isEditingName,
                           nameDraft,
                           setNameDraft,
                           onStartEditName,
                           onSaveName,
                           onCancelNameEdit,
                           newMemberName,
                           setNewMemberName,
                           onAddMember,
                           onRemoveMember,
                           onLeaveList,
                       }) {
    const owner = list.members.find((m) => m.id === list.ownerId);

    return (
        <header>
            {/* Name row */}
            <div style={styles.nameRow}>
                {isEditingName && isOwner ? (
                    <>
                        <input
                            style={styles.input}
                            value={nameDraft}
                            onChange={(e) => setNameDraft(e.target.value)}
                        />
                        <button style={styles.button} onClick={onSaveName}>
                            Save
                        </button>
                        <button
                            style={styles.secondaryButton}
                            onClick={onCancelNameEdit}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <h1 style={styles.title}>{list.name}</h1>
                        {isOwner && (
                            <button
                                style={styles.button}
                                onClick={onStartEditName}
                            >
                                Edit name
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Owner / members */}
            <div style={styles.membersSection}>
                <div>
                    <div style={styles.sectionLabel}>Owner</div>
                    <div>{owner ? owner.name : "Unknown"}</div>
                </div>

                <div>
                    <div style={styles.sectionLabel}>Members</div>
                    <ul style={styles.memberList}>
                        {list.members.map((m) => (
                            <li key={m.id} style={styles.memberItem}>
                                <span>{m.name}</span>
                                {isOwner && m.id !== list.ownerId && (
                                    <button
                                        style={styles.smallDangerButton}
                                        onClick={() => onRemoveMember(m.id)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={styles.membersControls}>
                    {isOwner && (
                        <form onSubmit={onAddMember} style={styles.inlineForm}>
                            <input
                                style={styles.input}
                                placeholder="New member name"
                                value={newMemberName}
                                onChange={(e) => setNewMemberName(e.target.value)}
                            />
                            <button style={styles.button} type="submit">
                                Add member
                            </button>
                        </form>
                    )}

                    {currentUserIsMember && !isOwner && (
                        <button
                            style={styles.dangerButton}
                            onClick={onLeaveList}
                        >
                            Leave this list
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

function ItemsToolbar({ filter, onChangeFilter }) {
    return (
        <div style={styles.filterRow}>
            <span style={styles.sectionLabel}>Items</span>
            <div>
                <button
                    style={
                        filter === "unresolved"
                            ? styles.filterButtonActive
                            : styles.filterButton
                    }
                    onClick={() => onChangeFilter("unresolved")}
                >
                    Unresolved only
                </button>
                <button
                    style={
                        filter === "all"
                            ? styles.filterButtonActive
                            : styles.filterButton
                    }
                    onClick={() => onChangeFilter("all")}
                >
                    All items
                </button>
            </div>
        </div>
    );
}

function ItemsList({
                       items,
                       onToggleResolved,
                       onRemoveItem,
                       onIncreaseQuantity,
                       onDecreaseQuantity,
                   }) {
    if (items.length === 0) {
        return (
            <p style={{ fontStyle: "italic", marginTop: "8px" }}>
                No items to display.
            </p>
        );
    }

    return (
        <ul style={styles.itemList}>
            {items.map((item) => (
                <li key={item.id} style={styles.itemRow}>
                    <div style={styles.itemLeft}>
                        <label style={styles.itemLabel}>
                            <input
                                type="checkbox"
                                checked={item.resolved}
                                onChange={() => onToggleResolved(item.id)}
                            />
                            <span
                                style={{
                                    ...styles.itemName,
                                    textDecoration: item.resolved
                                        ? "line-through"
                                        : "none",
                                    opacity: item.resolved ? 0.6 : 1,
                                }}
                            >
                {item.name}
              </span>
                        </label>

                        <div style={styles.quantityControls}>
                            <button
                                type="button"
                                style={styles.quantityButton}
                                onClick={() => onDecreaseQuantity(item.id)}
                            >
                                −
                            </button>
                            <span style={styles.quantityValue}>{item.quantity}</span>
                            <button
                                type="button"
                                style={styles.quantityButton}
                                onClick={() => onIncreaseQuantity(item.id)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        style={styles.smallDangerButton}
                        onClick={() => onRemoveItem(item.id)}
                    >
                        Remove
                    </button>
                </li>
            ))}
        </ul>
    );
}

function NewItemForm({ newItemName, setNewItemName, onAddItem }) {
    return (
        <form onSubmit={onAddItem} style={styles.addItemForm}>
            <input
                style={styles.input}
                placeholder="Add new item"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
            />
            <button style={styles.button} type="submit">
                Add
            </button>
        </form>
    );
}

// Simple inline styles for visual display

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
    },
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "800px",
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    title: {
        margin: 0,
        fontSize: "1.6rem",
        flexGrow: 1,
    },
    membersSection: {
        marginTop: "16px",
        display: "grid",
        gridTemplateColumns: "1fr 1.5fr",
        gap: "16px",
    },
    sectionLabel: {
        fontSize: "0.8rem",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#666",
        marginBottom: "4px",
    },
    memberList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
    },
    memberItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "2px 0",
    },
    membersControls: {
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "8px",
    },
    input: {
        padding: "6px 8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        flexGrow: 1,
    },
    button: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#2563eb",
        color: "#fff",
        fontSize: "0.9rem",
    },
    secondaryButton: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        cursor: "pointer",
        background: "#fff",
        fontSize: "0.9rem",
    },
    dangerButton: {
        padding: "6px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#dc2626",
        color: "#fff",
        fontSize: "0.9rem",
        alignSelf: "flex-start",
    },
    smallDangerButton: {
        padding: "4px 8px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: "#dc2626",
        color: "#fff",
        fontSize: "0.75rem",
    },
    inlineForm: {
        display: "flex",
        gap: "8px",
    },
    filterRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "8px",
    },
    filterButton: {
        padding: "4px 10px",
        marginLeft: "4px",
        borderRadius: "16px",
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        fontSize: "0.8rem",
    },
    filterButtonActive: {
        padding: "4px 10px",
        marginLeft: "4px",
        borderRadius: "16px",
        border: "1px solid #2563eb",
        background: "#2563eb",
        color: "#fff",
        cursor: "pointer",
        fontSize: "0.8rem",
    },
    itemList: {
        listStyle: "none",
        padding: 0,
        marginTop: "8px",
        marginBottom: "8px",
    },
    itemRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid",
    },
    itemLeft: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: "1",
    },
    itemLabel: {
        display: "flex",
        alignItems: "center",
        flex: "1",
        minWidth: 0,
    },
    itemName: {
        marginLeft: "8px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    addItemForm: {
        display: "flex",
        gap: "8px",
        marginTop: "8px",
    },
    quantityControls: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginRight: "8px",
    },
    quantityButton: {
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
        fontSize: "0.8rem",
    },
    quantityValue: {
        minWidth: "20px",
        textAlign: "center",
        fontSize: "0.9rem",
    },
};
