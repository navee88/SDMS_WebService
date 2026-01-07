import {CF_decrypt} from "../../../Components/Common/encryptiondecryption";



export const handleExportCommon = async ({
  rows,
  buildRequest,
  postData,
  setLoading,
  setLoadingText,
  setErrorDialog,
  t
}) => {
 
  if (!rows || rows.length === 0) {
    setErrorDialog({
      open: true,
      message: t("masters.selectRecord"),
      type: "information",
    });
    return;
  }
  try {
    setLoading(true);
    setLoadingText(t("scheduler.loading"));


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
