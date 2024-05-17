import config from "./config.json";
import http from "./apiUrl";

async function executeBasicAuthService(token) {
  return http.get(config.apiUrl + "/api/v1/security/basic-auth", {
    headers: {
      Authorization: token,
    },
  });
}

export default {
  executeBasicAuthService,
};
