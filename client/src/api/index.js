import * as real from "./realApi";
import * as mock from "./mockApi";
import { USE_MOCK } from "../config/currentUser";

export const api = USE_MOCK ? mock : real;
export { USE_MOCK };
