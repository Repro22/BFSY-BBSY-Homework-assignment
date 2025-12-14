export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const CURRENT_USER_ID = USE_MOCK
    ? (import.meta.env.VITE_MOCK_USER_ID || "user-1")
    : (import.meta.env.VITE_CURRENT_USER_ID || "user-1");

export const CURRENT_PROFILE = import.meta.env.VITE_CURRENT_PROFILE || "user";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
