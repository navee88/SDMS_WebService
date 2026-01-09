import Cookies from "js-cookie";

export function CF_cookieClear() {
  try {
    const allCookies = Cookies.get();
    console.log("All Cookies to be cleared:", allCookies);
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });
  } catch (err) {
    console.error("CF_cookieClear error:", err);
  }
}
