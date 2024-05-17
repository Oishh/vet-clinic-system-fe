import config from "./config.json";
import http from "./apiUrl";

function retrieveClients() {
  return http.get(config.apiUrl + "/api/v1/clients");
}

function createClient(clientData) {
  return http.post(config.apiUrl + "/api/v1/clients", clientData);
}

function deleteClientById(clientId) {
  return http.delete(config.apiUrl + "/api/v1/clients/" + clientId);
}

function updateClient(clientId, clientData) {
  return http.put(config.apiUrl + "/api/v1/clients/" + clientId, clientData);
}

export default {
  retrieveClients,
  createClient,
  deleteClientById,
  updateClient,
};
