import type { AccountSnapshot } from "./common.js";

declare global {
  namespace Express {
    interface Request {
      /** Unique request id (set by request-id middleware). */
      requestId: string;
      /** Authenticated account snapshot (set by auth middleware). */
      user?: AccountSnapshot;
      /** Original request ip (normalized helper). */
      clientIp?: string;
    }
    interface Response {
      /** Optional error logged flag to avoid double-logging in error middleware. */
      errorLogged?: boolean;
    }
  }
}

export {};
