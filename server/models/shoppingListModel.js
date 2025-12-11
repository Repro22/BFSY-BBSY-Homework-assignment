const mongoose = require("mongoose");

const listItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, default: 1, min: 1 },
        resolved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const listMembershipSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["owner", "member"],
            required: true,
        },
    },
    { _id: false }
);

const shoppingListSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        archived: { type: Boolean, default: false },
        members: { type: [listMembershipSchema], default: [] },
        items: { type: [listItemSchema], default: [] },
    },
    { timestamps: true }
);

shoppingListSchema.index({ archived: 1 });
shoppingListSchema.index({ "members.userId": 1 });
shoppingListSchema.index({ "items.quantity": 1 });

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

module.exports = { ShoppingList };
