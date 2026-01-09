export function CF_localClear() {
  try {
    localStorage.clear();
  } catch (err) {
    console.error("CF_localClear error:", err);
  }
}
