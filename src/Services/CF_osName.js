export function getOSName(callback) {
  if (document.readyState === "complete") {
    detectOS(callback);
  } else {
    window.addEventListener("load", () => detectOS(callback));
  }
}

function detectOS(callback) {
  const userAgent = navigator.userAgent;
  const platform = navigator.userAgentData?.platform || navigator.platform;
  let osName = "Unknown";

  const finalize = (result) => {
    if (callback) callback(result);
  };

  if (platform?.includes("Win")) {
    if (navigator.userAgentData?.getHighEntropyValues) {
      navigator.userAgentData
        .getHighEntropyValues(["platformVersion"])
        .then((ua) => {
          if (ua.platformVersion) {
            const major = parseInt(ua.platformVersion.split(".")[0], 10);
            if (!isNaN(major)) {
              osName = major >= 13 ? "Windows 11" : "Windows 10";
              return finalize(osName);
            }
          }
          finalize("Windows 10/11");
        })
        .catch(() => {
          finalize("Windows 10/11");
        });
    } else {
     
      finalize("Windows 10/11");
    }
  }

  else if (platform?.includes("Mac")) finalize("Mac OS");

  else if (platform?.includes("Linux")) finalize("Linux");

  else if (/Android/.test(userAgent)) finalize("Android");
 
  else if (/iPhone|iPad|iPod/.test(userAgent)) finalize("iOS");
  else finalize("Unknown");
}
