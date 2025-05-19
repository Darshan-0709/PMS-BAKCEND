import { UserContext } from "../src/auth/userContext";

declare global {
    namespace Express {
        interface Request {
            user?: UserContext;
        }
    }
}

export {};
