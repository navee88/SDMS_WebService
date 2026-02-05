import { useCallback } from "react";
import { api } from "../Api/config";
import { CF_encrypt } from "../Components/Common/encryptiondecryption";

export default function useAxios() {
  const postData = useCallback(async (endpoint, data = {},header={}) => {
    try {
      const encrypted = CF_encrypt(JSON.stringify(data));
      const payloadata = { passObj: encrypted };
        const session = sessionStorage.getItem("Token"); 
      const response = await api.post(`/${endpoint}`, payloadata, {
        headers: { "Content-Type": "application/json", Authorization: session ? `${session}` : null,...header },
      });
      console.log(`API Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      throw endpoint;
    }
  }, []);

  return { postData};
}
