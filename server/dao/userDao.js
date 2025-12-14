const { User } = require("../models/userModel");

async function listUsers() {
    const docs = await User.find({}, { _id: 1, name: 1 }).lean();
    return docs.map((u) => ({
        id: String(u._id),
        name: u.name,
    }));
}

module.exports = { listUsers };
