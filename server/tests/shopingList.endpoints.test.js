const request = require("supertest");

// mock the list-role middleware so these endpoint tests don't hit MongoDB
jest.mock("../middlewares/listRoleMiddleware", () => ({
    requireListRoleMiddleware: () => (req, res, next) => next(),
}));

// Mock shoppingList service layer
jest.mock("../services/shoppingListService", () => ({
    getListOverview: jest.fn(),
    createList: jest.fn(),
    getListDetail: jest.fn(),
    deleteListService: jest.fn(),
    updateListService: jest.fn(),
    // other exports exist in the real module, but aren't needed for these tests
    addMember: jest.fn(),
    removeMember: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    setArchivedService: jest.fn(),
}));

// Prevent mongoose from attempting a real DB connection when app.js is imported
jest.mock("mongoose", () => {
    const actual = jest.requireActual("mongoose");
    return {
        ...actual,
        connect: jest.fn(() => Promise.resolve()),
    };
});

const {
    getListOverview,
    createList,
    getListDetail,
    deleteListService,
    updateListService,
} = require("../services/shoppingListService");

const { app } = require("../app");

const authHeader = (userId = "user-1", profile = "user") => ({
    Authorization: `Bearer ${userId}|${profile}`,
});

describe("ShoppingList endpoints (unit tests w/ mocked service)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /lists (list overview)", () => {
        test("happy day: returns 200 and dtoOut with lists", async () => {
            getListOverview.mockResolvedValueOnce({
                data: {
                    page: 1,
                    pageSize: 20,
                    total: 1,
                    lists: [{ id: "l1", name: "Groceries" }],
                },
            });

            const res = await request(app)
                .get("/lists?page=1&pageSize=20")
                .set(authHeader());

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("data");
            expect(res.body.data).toHaveProperty("lists");
            expect(res.body.data.lists).toHaveLength(1);

            // Joi keeps query params as strings with the current config
            expect(getListOverview).toHaveBeenCalledWith(
                expect.objectContaining({ userId: "user-1", page: "1", pageSize: "20" }),
                false
            );
        });

        test("alternative: invalid query params => 400 validationFailed", async () => {
            const res = await request(app)
                .get("/lists?page=0") // page must be >= 1
                .set(authHeader());

            expect(res.status).toBe(400);
            expect(res.body?.errorMap?.[0]?.code).toBe("validationFailed");
            expect(getListOverview).not.toHaveBeenCalled();
        });
    });

    describe("GET /lists/:listId (single record)", () => {
        test("happy day: returns 200 and list detail", async () => {
            getListDetail.mockResolvedValueOnce({
                data: { list: { id: "l1", name: "Groceries", items: [] } },
            });

            const res = await request(app)
                .get("/lists/l1")
                .set(authHeader());

            expect(res.status).toBe(200);
            expect(res.body.data.list).toMatchObject({ id: "l1", name: "Groceries" });
            expect(getListDetail).toHaveBeenCalledWith(
                expect.objectContaining({ listId: "l1", userId: "user-1" })
            );
        });

        test("alternative: list not found => 404 listNotFound", async () => {
            getListDetail.mockResolvedValueOnce({
                notFound: true,
                data: { list: null },
                error: {
                    code: "listNotFound",
                    message: "List l-does-not-exist not found or not accessible",
                },
            });

            const res = await request(app)
                .get("/lists/l-does-not-exist")
                .set(authHeader());

            expect(res.status).toBe(404);
            expect(res.body?.errorMap?.[0]?.code).toBe("listNotFound");
        });
    });

    describe("POST /lists (create record)", () => {
        test("happy day: returns 201 and created list", async () => {
            createList.mockResolvedValueOnce({
                data: { list: { id: "l1", name: "Groceries" } },
            });

            const res = await request(app)
                .post("/lists")
                .set(authHeader())
                .send({ name: "Groceries" });

            expect(res.status).toBe(201);
            expect(res.body.data.list).toMatchObject({ id: "l1", name: "Groceries" });
            expect(createList).toHaveBeenCalledWith(
                expect.objectContaining({ name: "Groceries", userId: "user-1" })
            );
        });

        test("alternative: missing name => 400 validationFailed", async () => {
            const res = await request(app).post("/lists").set(authHeader()).send({});

            expect(res.status).toBe(400);
            expect(res.body?.errorMap?.[0]?.code).toBe("validationFailed");
            expect(createList).not.toHaveBeenCalled();
        });
    });

    describe("DELETE /lists/:listId (delete record)", () => {
        test("happy day: returns 200 and deleted:true", async () => {
            deleteListService.mockResolvedValueOnce({ status: "ok" });

            const res = await request(app).delete("/lists/l1").set(authHeader());

            expect(res.status).toBe(200);
            expect(res.body.data).toMatchObject({ listId: "l1", deleted: true });
            expect(deleteListService).toHaveBeenCalledWith(
                expect.objectContaining({ listId: "l1", userId: "user-1" })
            );
        });

        test("alternative: service invalidId => 400 invalidId", async () => {
            deleteListService.mockResolvedValueOnce({ status: "invalidId" });

            const res = await request(app)
                .delete("/lists/not-an-objectid")
                .set(authHeader());

            expect(res.status).toBe(400);
            expect(res.body?.errorMap?.[0]?.code).toBe("invalidId");
        });
    });

    describe("PATCH /lists/:listId (update record)", () => {
        test("happy day: returns 200 and updated list", async () => {
            updateListService.mockResolvedValueOnce({
                list: {
                    _id: "l1",
                    name: "New name",
                    members: [],
                    items: [],
                    isArchived: false,
                },
            });

            const res = await request(app)
                .patch("/lists/l1")
                .set(authHeader())
                .send({ name: "New name" });

            expect(res.status).toBe(200);
            expect(res.body.data.list).toHaveProperty("name", "New name");
            expect(updateListService).toHaveBeenCalledWith(
                expect.objectContaining({
                    listId: "l1",
                    name: "New name",
                    userId: "user-1",
                })
            );
        });

        test("alternative: missing body fields => 400 validationFailed", async () => {
            const res = await request(app)
                .patch("/lists/l1")
                .set(authHeader())
                .send({});

            expect(res.status).toBe(400);
            expect(res.body?.errorMap?.[0]?.code).toBe("validationFailed");
            expect(updateListService).not.toHaveBeenCalled();
        });
    });
});
