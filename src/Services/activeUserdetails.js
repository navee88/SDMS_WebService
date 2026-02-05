import { CF_sessionGet } from "../Components/Common/CF_session";

export default function CF_activeUserdetails() {
  const ActiveUserDetails = {
    sUserDomainName: CF_sessionGet("sDomainName", 1) || "",
    sSessionID: CF_sessionGet("sSessionID",1) || "",
    sUserID: CF_sessionGet("sUserID",1) || "",
    sTimeZoneID: (CF_sessionGet("sTimeZoneValue", 1) || "") + "<~>true",
    sApplicationName: "SDMS",
    sdbtype: CF_sessionGet("sdbtype",1) || "",
    sUsername: CF_sessionGet("sUsername", 1) || "",
    sSiteCode: CF_sessionGet("sSiteCode", 1) || "",
    sCategories: CF_sessionGet("sCategories",1) || "",
    sUserGroupID: CF_sessionGet("sUserGroupID", 1) || "",
    sUserStatus: CF_sessionGet() || "",
    sTenantID: CF_sessionGet() || ""
  };
  return {
    ActiveUserDetails,
    ApplicationCode: "SDMS",
    appname:"SDMS"
  };
}
