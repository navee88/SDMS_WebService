import {CF_decrypt} from "../../../Components/Common/encryptiondecryption";

/**
 * Common export handler
 */
export const handleExportCommon = async ({
  rows,
  buildRequest,
  postData,
  setLoading,
  setLoadingText,
  setErrorDialog,
}) => {
  if (!rows || rows.length === 0) {
    setErrorDialog({
      open: true,
      message: "Select an existing record.",
      type: "information",
    });
    return;
  }

  try {
    setLoading(true);
    setLoadingText("Preparing export file...");

    const requestPayload = buildRequest();
    const response = await postData(
      "basemaster/exportDataFile",
      requestPayload
    );

    if (response?.ExportDataViewURL) {
      const exportUrl = CF_decrypt(response.ExportDataViewURL);
      window.open(exportUrl, "_blank");
    } else {
      setErrorDialog({
        open: true,
        message: "Export file not generated",
        type: "error",
      });
    }
  } catch (err) {
    console.error("Export failed:", err);
    setErrorDialog({
      open: true,
      message: "Export failed",
      type: "error",
    });
  } finally {
    setLoading(false);
    setLoadingText("");
  }
};
