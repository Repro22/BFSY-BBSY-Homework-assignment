import { api } from "../api";

export const userService = {
    async listUsers() {
        return api.listUsers();
    },
};
