import axios from "axios";

export const api = axios.create({
 baseURL:"http://localhost:9090/SDMS_WebService/",
  timeout: 60000
});

export const SECRET_KEY = "AGARAM_SDMS_SCRT";
export const ITERATIONS = 100;
