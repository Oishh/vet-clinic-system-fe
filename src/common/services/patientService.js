import config from "./config.json";
import http from "./apiUrl";

function retrievePatients() {
  return http.get(config.apiUrl + "/api/v1/patients");
}

function createPatientForClient(id, patientData) {
  return http.post(
    config.apiUrl + "/api/v1/clients/" + id + "/patients",
    patientData
  );
}

function deletePatientById(patientId) {
  return http.delete(config.apiUrl + "/api/v1/patients/" + patientId);
}

function updatePatient(clientId, patientId, patientData) {
  return http.put(
    config.apiUrl + "/api/v1/clients/" + clientId + "/patients/" + patientId,
    patientData
  );
}

export default {
  retrievePatients,
  createPatientForClient,
  deletePatientById,
  updatePatient,
};
