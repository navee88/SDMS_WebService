import { CF_sessionClear } from "./CF_session";
import { CF_localClear } from "./CF_local";
import { CF_cookieClear } from "./CF_cookie";

export function CF_clearAuthData() {
  CF_sessionClear();
  // CF_localClear();
  CF_cookieClear();
}
