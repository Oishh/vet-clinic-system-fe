import config from "./config.json";
import http from "./apiUrl";

function retrieveVets() {
  return http.get(config.apiUrl + "/api/v1/veterinarians");
}

function createVet(vetData) {
  return http.post(config.apiUrl + "/api/v1/veterinarians", vetData);
}

function deleteVetById(vetId) {
  return http.delete(config.apiUrl + "/api/v1/veterinarians/" + vetId);
}

function updateVet(vetId, vetData) {
  return http.put(config.apiUrl + "/api/v1/veterinarians/" + vetId, vetData);
}

export default {
  retrieveVets,
  createVet,
  deleteVetById,
  updateVet,
};
