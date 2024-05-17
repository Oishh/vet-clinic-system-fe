import config from "./config.json";
import http from "./apiUrl";

function retrieveInventory() {
  return http.get(config.apiUrl + "/api/v1/inventory");
}

function createInventory(inventoryData) {
  return http.post(config.apiUrl + "/api/v1/inventory", inventoryData);
}

function deleteInventoryById(inventoryId) {
  return http.delete(config.apiUrl + "/api/v1/inventory/" + inventoryId);
}

function updateStock(inventoryId, newStock) {
  return http.put(
    config.apiUrl + "/api/v1/inventory/" + inventoryId + "/stock",
    newStock
  );
}

function updateInventory(inventoryId, inventoryDetails) {
  return http.put(
    config.apiUrl + "/api/v1/inventory/" + inventoryId,
    inventoryDetails
  );
}

export default {
  retrieveInventory,
  createInventory,
  updateStock,
  deleteInventoryById,
  updateInventory,
};
