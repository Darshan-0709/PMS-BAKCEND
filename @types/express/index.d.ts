import { UserContext } from "../../src/auth/userContext";

declare namespace Express {
    export interface Request {
        user?: UserContext;
    }
}
