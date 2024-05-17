import config from "./config.json";
import http from "./apiUrl";

function retrieveAllOrders() {
  return http.get(config.apiUrl + "/api/v1/orders");
}

function retrieveOrderForClient(clientId) {
  return http.get(config.apiUrl + "/api/v1/clients/" + clientId + "/order");
}

function confirmOrderStatus(orderId) {
  return http.put(config.apiUrl + "/api/v1/orders/" + orderId + "/status");
}

function updateOrderNumber(orderId, orderDetails) {
  return http.put(
    config.apiUrl + "/api/v1/orders/" + orderId + "/order-num",
    orderDetails
  );
}

function updateTimestamp(orderId, orderDetails) {
  return http.put(
    config.apiUrl + "/api/v1/orders/" + orderId + "/timestamp",
    orderDetails
  );
}

function createOrderForClient(clientId, inventoryId, orderDetails) {
  return http.post(
    config.apiUrl +
      "/api/v1/clients/" +
      clientId +
      "/inventory/" +
      inventoryId +
      "/order",
    orderDetails
  );
}

export default {
  retrieveOrderForClient,
  createOrderForClient,
  confirmOrderStatus,
  retrieveAllOrders,
  updateOrderNumber,
  updateTimestamp,
};
