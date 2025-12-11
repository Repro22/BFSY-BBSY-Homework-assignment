function mapListToSummary(list, currentUserId) {
    const items = list.items || [];
    const members = list.members || [];

    const itemsCount = items.length;
    const unresolvedItemsCount = items.filter((i) => !i.resolved).length;

    const isOwner = members.some(
        (m) =>
            m.userId.toString() === currentUserId.toString() && m.role === "owner"
    );

    return {
        id: list._id.toString(),
        name: list.name,
        archived: !!list.archived,
        itemsCount,
        unresolvedItemsCount,
        isOwner,
    };
}

function mapListToDetail(list) {
    const members = list.members || [];
    const items = list.items || [];

    return {
        id: list._id.toString(),
        name: list.name,
        archived: !!list.archived,
        members: members.map((m) => ({
            userId: m.userId.toString(),
            role: m.role,
        })),
        items: items.map((i) => ({
            id: i._id.toString(),
            name: i.name,
            quantity: i.quantity,
            resolved: i.resolved,
        })),
        createdAt: list.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: list.updatedAt?.toISOString?.() || new Date().toISOString(),
    };
}

module.exports = {
    mapListToSummary,
    mapListToDetail,
};
