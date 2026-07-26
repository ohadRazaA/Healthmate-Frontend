import axios from "axios";

const COLD_START_TIMEOUT_MS = 25000; // first request only
const NORMAL_TIMEOUT_MS = 15000; // every request after
 
let hasSentFirstRequest = false;
 
axios.interceptors.request.use((config) => {
  if (config.timeout === undefined) {
    config.timeout = hasSentFirstRequest ? NORMAL_TIMEOUT_MS : COLD_START_TIMEOUT_MS;
  }
  hasSentFirstRequest = true;
  return config;
});
 
export default axios;