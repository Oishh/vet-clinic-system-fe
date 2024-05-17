import config from "./config.json";
import http from "./apiUrl";

function retrieveAppointments() {
  return http.get(config.apiUrl + "/api/v1/appointments");
}

function createAppointmentForClient(id, appointmentData) {
  return http.post(
    config.apiUrl + "/api/v1/clients/" + id + "/appointments",
    appointmentData
  );
}

function deleteAppointmentById(appointmentId) {
  return http.delete(config.apiUrl + "/api/v1/appointments/" + appointmentId);
}

function updateAppointment(clientId, appointmentId, appointmentData) {
  return http.put(
    config.apiUrl +
      "/api/v1/clients/" +
      clientId +
      "/appointments/" +
      appointmentId,
    appointmentData
  );
}

function toggleStatus(id) {
  return http.put(config.apiUrl + "/api/v1/appointments/" + id + "/status");
}

export default {
  retrieveAppointments,
  createAppointmentForClient,
  toggleStatus,
  updateAppointment,
  deleteAppointmentById,
};
