// import { create } from 'zustand';

// // Supported extensions list
// const SUPPORTED_EXTENSIONS = [
//   "pdf","txt","gif","png","jpg","jpeg","tiff","tif",
//   "csv","img","log","xls","xlsx","doc","docx",
//   "mp4","3gp","mp3","aac","eac3","ac3","flv","avi","swf","mkv","wmv"
// ];

// const OFFICE_EXTENSIONS = ["xls", "xlsx", "doc", "docx", "csv"];

// export const useFileViewerStore = create((set, get) => ({
//   viewerState: {
//     isLoading: false,
//     contentUrl: null,
//     fileType: null, // 'image', 'office', 'iframe', 'unsupported', 'error'
//     errorMsg: null,
//     isLoaded: false,
//     currentFileId: null
//   },

//   resetViewer: () => set({ 
//     viewerState: { isLoading: false, contentUrl: null, fileType: null, errorMsg: null, isLoaded: false, currentFileId: null } 
//   }),

//   fetchFileView: async (fileData, apiFunction, userDetails) => {
//     const { viewerState } = get();
    
//     // 1. Get the Unique ID (RecordNo)
//     const recordNo = fileData["RecordNo"] || fileData["id"] || fileData["sRecordNo"];

//     // 2. Prevent refetching if already loaded
//     if (viewerState.currentFileId === recordNo && viewerState.isLoaded) return;

//     // 3. Reset state for new fetch
//     set({ viewerState: { ...viewerState, isLoading: true, errorMsg: null, currentFileId: recordNo } });

//     try {
//       const fileName = fileData["File Name"] || fileData.sFileName;
//       if (!fileName) throw new Error("No Filename found");

//       // 4. Extract Extension
//       const extension = fileName.split('.').pop().toLowerCase();

//       // 5. Check Supported Extensions
//       if (!SUPPORTED_EXTENSIONS.includes(extension)) {
//         set({ 
//           viewerState: { 
//             isLoading: false, 
//             fileType: 'unsupported', 
//             contentUrl: null, 
//             isLoaded: true,
//             currentFileId: recordNo
//           } 
//         });
//         return;
//       }

//       // 6. PREPARE PAYLOAD (Mapping Grid Data to API Request)
//       // We trim() values because your sample data had "Folder    " and "T1        "
//       const payload = {
//         sRecordNo: recordNo,
//         sTaskID: (fileData["TaskID"] || fileData["sTaskID"] || "").trim(),
//         sClientID: userDetails.sClientID || "", 
//         sType: (fileData["Type"] || fileData["sType"] || "File").trim(),
//         sFilePath: fileData["File Path"] || fileData["sFilePath"] || "",
//         sBrowserURL: window.location.origin, 
//         ScreenModuleName: "Data Explorer",
//         sFrom: null, // Explicitly Null as requested
//         sTo: null,   // Explicitly Null as requested
        
//         // Note: activeUserdetails is usually handled by your postData wrapper.
//         // If your backend specifically needs 'ActiveUserDetails' inside the body, 
//         // the postData wrapper in useServerDataApi usually merges it.
//       };

//       console.log("File Viewer Payload:", payload); // Debugging

//       // 7. API Call
//       const response = await apiFunction(payload);

//       // 8. Handle Response
//       if (response && response.Rtn && response.Rtn.toLowerCase() === "success") {
        
//         let urlPath = response.ServerDataViewURL; 
        
//         // Fix URL path formatting
//         if (urlPath) {
//             const count = urlPath.lastIndexOf("\\") + 1;
//             const fn = encodeURIComponent(urlPath.substring(count));
//             urlPath = urlPath.substring(0, count) + fn;
//         }

//         // Determine View Type
//         let type = 'iframe';
//         if (["jpg", "jpeg", "png", "gif", "img", "tiff", "tif"].includes(extension)) {
//             type = 'image';
//         } else if (OFFICE_EXTENSIONS.includes(extension)) {
//             type = 'office';
//         }

//         set({ 
//           viewerState: { 
//             isLoading: false, 
//             contentUrl: urlPath, 
//             fileType: type, 
//             errorMsg: null, 
//             isLoaded: true,
//             currentFileId: recordNo
//           } 
//         });

//       } else {
//         throw new Error(response?.Message || "Failed to load file");
//       }

//     } catch (error) {
//       console.error("File Viewer Error:", error);
//       set({ 
//         viewerState: { 
//           isLoading: false, 
//           errorMsg: error.message, 
//           fileType: 'error',
//           isLoaded: true,
//           currentFileId: recordNo
//         } 
//       });
//     }
//   }
// }));


import { create } from 'zustand';
import { CF_decrypt } from '../../../../Common/encryptiondecryption'; // Ensure this path is correct
import { api } from '../../../../../Api/config';


// Supported extensions list
const SUPPORTED_EXTENSIONS = [
  "pdf","txt","gif","png","jpg","jpeg","tiff","tif",
  "csv","img","log","xls","xlsx","doc","docx",
  "mp4","3gp","mp3","aac","eac3","ac3","flv","avi","swf","mkv","wmv"
];

const OFFICE_EXTENSIONS = ["xls", "xlsx", "doc", "docx", "csv"];

export const useFileViewerStore = create((set, get) => ({
  viewerState: {
    isLoading: false,
    contentUrl: null,
    fileType: null, 
    errorMsg: null,
    isLoaded: false,
    currentFileId: null
  },

  resetViewer: () => set({ 
    viewerState: { isLoading: false, contentUrl: null, fileType: null, errorMsg: null, isLoaded: false, currentFileId: null } 
  }),

  fetchFileView: async (fileData, apiFunction, userDetails) => {
    const { viewerState } = get();
    
    // 1. Get ID
    const recordNo = fileData["RecordNo"] || fileData["id"] || fileData["sRecordNo"];

    // 2. Prevent re-fetch
    if (viewerState.currentFileId === recordNo && viewerState.isLoaded) return;

    // 3. Set Loading
    set({ viewerState: { ...viewerState, isLoading: true, errorMsg: null, currentFileId: recordNo } });

    const dynamicBaseURL = api.defaults.baseURL;

    console.log("Dynamic Url",dynamicBaseURL);
    const url = new URL(dynamicBaseURL);
console.log("Url",url);
    const browserRoot = `${url.protocol}//${url.host}`;
    console.log("Dynamic Root",browserRoot);

    try {
      const fileName = fileData["File Name"] || fileData.sFileName;
      if (!fileName) throw new Error("No Filename found");

      const extension = fileName.split('.').pop().toLowerCase();

      if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        set({ 
          viewerState: { 
            isLoading: false, 
            fileType: 'unsupported', 
            contentUrl: null, 
            isLoaded: true,
            currentFileId: recordNo
          } 
        });
        return;
      }

      // 4. Prepare Payload
      const payload = {
        sRecordNo: recordNo,
        sTaskID: (fileData["TaskID"] || fileData["sTaskID"] || "").trim(),
        sClientID: userDetails.sClientID || "", 
        sType: (fileData["Type"] || fileData["sType"] || "File").trim(),
        sFilePath: fileData["File Path"] || fileData["sFilePath"] || "",
        sBrowserURL: browserRoot, 
        ScreenModuleName: "Data Explorer",
        sFrom: null, 
        sTo: null,   
      };

      // 5. API Call
      const response = await apiFunction(payload);

      // 6. Handle Response & Decrypt
      if (response && response.Rtn && response.Rtn.toLowerCase() === "success") {
        
        const encryptedUrl = response.ServerDataViewURL;
        let urlPath = encryptedUrl;

        // --- DECRYPTION LOGIC START ---
        try {
            // Directly use the imported function
            if (encryptedUrl) {
                urlPath = CF_decrypt(encryptedUrl);
            }
        } catch (e) {
            console.error("Decryption Failed:", e);
            // Fallback: keep urlPath as encryptedUrl or handle error as needed
        }
        
        // --- LOGGING TO CONSOLE ---
        console.group("🔓 File Viewer Decryption");
        console.log("Encrypted:", encryptedUrl);
        console.log("Decrypted:", urlPath);
        console.groupEnd();
        // --------------------------

        // Fix URL formatting
        if (urlPath) {
            const count = urlPath.lastIndexOf("\\") + 1;
            if(count > 0) {
                const fn = encodeURIComponent(urlPath.substring(count));
                urlPath = urlPath.substring(0, count) + fn;
            }
        }

        // Determine View Type
        let type = 'iframe';
        if (["jpg", "jpeg", "png", "gif", "img", "tiff", "tif"].includes(extension)) {
            type = 'image';
        } else if (OFFICE_EXTENSIONS.includes(extension)) {
            type = 'office';
        }

        set({ 
          viewerState: { 
            isLoading: false, 
            contentUrl: urlPath, 
            fileType: type, 
            errorMsg: null, 
            isLoaded: true,
            currentFileId: recordNo
          } 
        });

      } else {
        throw new Error(response?.Message || "Failed to load file");
      }

    } catch (error) {
      console.error("Viewer Error:", error);
      set({ 
        viewerState: { 
          isLoading: false, 
          errorMsg: error.message, 
          fileType: 'error',
          isLoaded: true,
          currentFileId: recordNo
        } 
      });
    }
  }
}));