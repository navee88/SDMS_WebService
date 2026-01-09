import axios from "axios";

export const api = axios.create({
//  baseURL:"http://localhost:9090/SDMS_WebService/",
//  baseURL:"http://192.168.0.166:9090/SDMS_WebService/",
  baseURL:"http://localhost:8094/SDMS_WebService/",
  timeout: 60000
});

export const SECRET_KEY = "AGARAM_SDMS_SCRT";
export const ITERATIONS = 100;
