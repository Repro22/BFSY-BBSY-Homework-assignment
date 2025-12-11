const Joi = require("joi");

// lists
const listListDtoInSchema = Joi.object({
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
});

const listCreateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
});

const listIdParamsSchema = Joi.object({
    listId: Joi.string().required(),
});

const listGetQuerySchema = Joi.object({
    includeResolved: Joi.boolean().default(false),
});

const listUpdateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(100).optional(),
}).min(1);

// members
const memberAddDtoInSchema = Joi.object({
    userId: Joi.string().required(),
});

const memberParamsSchema = Joi.object({
    listId: Joi.string().required(),
    userId: Joi.string().required(),
});

// items
const itemCreateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(200).required(),
    quantity: Joi.number().integer().min(1).default(1),
});

const itemUpdateDtoInSchema = Joi.object({
    name: Joi.string().min(1).max(200).optional(),
    quantity: Joi.number().integer().min(1).optional(),
    resolved: Joi.boolean().optional(),
}).min(1);

const itemParamsSchema = Joi.object({
    listId: Joi.string().required(),
    itemId: Joi.string().required(),
});

module.exports = {
    listListDtoInSchema,
    listCreateDtoInSchema,
    listIdParamsSchema,
    listGetQuerySchema,
    listUpdateDtoInSchema,
    memberAddDtoInSchema,
    memberParamsSchema,
    itemCreateDtoInSchema,
    itemUpdateDtoInSchema,
    itemParamsSchema,
};
