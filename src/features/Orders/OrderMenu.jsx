import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import clientService from "../../common/services/clientService";
import inventoryService from "../../common/services/inventoryService";
import orderService from "../../common/services/orderService";

function OrderMenu() {
  const toast = useRef(null);
  const [client, setClient] = useState("");
  const [quantity, setQuantity] = useState({ id: undefined, value: undefined });
  const [inventory, setInventory] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [layout, setLayout] = useState("grid");

  const fetchClients = async () => {
    try {
      const data = await clientService.retrieveClients();
      const clients = data.data;
      setClient(clients);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.retrieveInventory();
      const _inventory = data.data;
      setInventory(_inventory);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Product has been successfully ${detail}.`,
      life: 3000,
    });
  };

  const toastError = (detail) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: `${detail}.`,
      life: 3000,
    });
  };

  const handleAddToCartButton = (product, quantity, client) => {
    let _inventory = { ...product };
    let _client = { ...client };

    delete _inventory.orders;
    delete _client.orders;
    delete _client.patients;
    delete _client.appointments;

    const accept = () => {
      if (_inventory.stock !== 0) {
        let orderDetails = {};

        _inventory.stock = _inventory.stock - quantity;

        orderDetails["quantity"] = quantity;
        orderDetails["subTotal"] = product.price * quantity;
        orderDetails["total"] = product.price * quantity;
        orderDetails["inventory"] = _inventory;
        orderDetails["client"] = _client;

        inventoryService.updateStock(product.id, orderDetails.inventory);
        orderService.createOrderForClient(client.id, product.id, orderDetails);

        const table = { ...product, ...orderDetails.inventory };
        updateTable(product.id, table);
        toastSuccess("added to cart");
      } else {
        toastError("Item out of stock");
      }
    };

    const reject = () => {
      toast.current.show({
        severity: "warn",
        summary: "Rejected",
        detail: "You have rejected",
        life: 2000,
      });
    };

    confirmDialog({
      message: `Add ${product.name} to your cart?`,
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      position: "top",
      accept,
      reject,
    });
  };

  const updateTable = (id, rowData) => {
    const findIndexById = (id) => {
      let index = -1;
      for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    };
    const index = findIndexById(id);
    const newMenu = [...inventory];
    newMenu[index] = rowData;
    setInventory(newMenu);
  };

  const handleQuantityChange = (e, id) => {
    let _quantity = { id: id, value: e.target.value };
    setQuantity(_quantity);
  };

  const listItem = (product) => {
    var stockCount = [];
    for (let x = 1; x <= product.stock; x++) {
      stockCount[x] = x;
    }
    let _quantity = (quantity.id === product.id && quantity.value) || 1;

    return (
      <div className="col-12">
        <div className="flex flex-wrap xl:flex-row xl:align-items-start p-4 gap-4">
          <img
            className="w-9 xl:w-13rem shadow-2 block xl:block border-round"
            src={product.base64Data}
            alt={product.name}
          />
          <div className="flex flex-column sm:flex-row justify-content-between align-items-center xl:align-items-start flex-1 gap-4">
            <div className="flex flex-column align-items-center sm:align-items-start gap-3">
              <div className="text-2xl font-bold text-900">{product.name}</div>
              <div className="flex align-items-center gap-3">
                <span className="flex align-items-center gap-2">
                  <i className="pi pi-tag"></i>
                  <span className="font-semibold">{product.category}</span>
                </span>
                {product.stock !== 0 && product.stock >= 10 && (
                  <Tag>{product.stock} in stock</Tag>
                )}
                {product.stock !== 0 && product.stock < 10 && (
                  <Tag severity="warning">{product.stock} in stock</Tag>
                )}
                {product.stock === 0 && (
                  <Tag severity="danger">Out of stock</Tag>
                )}
              </div>
              <Dropdown
                options={stockCount}
                name={product.id}
                value={(quantity.id === product.id && quantity.value) || 1}
                placeholder="Quantity"
                onChange={(e) => handleQuantityChange(e, product.id)}
                className="w-full sm:w-4rem "
                disabled={product.stock === 0}
              />
            </div>
            <div className="flex sm:flex-column align-items-center sm:align-items-end gap-3 sm:gap-2">
              <span className="text-2xl font-semibold">₱{product.price}</span>
              <Button
                icon="pi pi-shopping-cart"
                className="p-button-rounded mt-6"
                disabled={product.stock === 0}
                onClick={() => {
                  handleAddToCartButton(
                    product,
                    _quantity,
                    selectedClient || client[0]
                  );
                }}
              ></Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const gridItem = (product) => {
    var stockCount = [];
    for (let x = 1; x <= product.stock; x++) {
      stockCount[x] = x;
    }

    let _quantity = (quantity.id === product.id && quantity.value) || 1;

    return (
      <div className="col-4 p-2">
        <div className="p-4 border-1 surface-border surface-card border-round">
          <div className="flex flex-wrap align-items-center justify-content-between gap-2 py-2">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-tag"></i>
              <span className="font-semibold">{product.category}</span>
            </div>
            {product.stock !== 0 && product.stock >= 10 && (
              <Tag>{product.stock} in stock</Tag>
            )}
            {product.stock !== 0 && product.stock < 10 && (
              <Tag severity="warning">{product.stock} in stock</Tag>
            )}
            {product.stock === 0 && <Tag severity="danger">Out of stock</Tag>}
          </div>
          <div className="flex flex-column align-items-center py-3">
            <img
              className="w-9 shadow-2 border-round"
              style={{ maxHeight: "200px", objectFit: "cover" }}
              src={product.base64Data}
              alt={product.name}
            />
          </div>

          <div className="flex justify-content-between mb-3">
            <span className="text-2xl font-semibold">₱{product.price}</span>

            <span className="text-2xl font-bold">{product.name}</span>
          </div>

          <div className="flex align-items-center justify-content-between">
            <Dropdown
              options={stockCount}
              name={product.id}
              value={(quantity.id === product.id && quantity.value) || 1}
              placeholder="Quantity"
              onChange={(e) => handleQuantityChange(e, product.id)}
              className="w-full sm:w-6rem"
              disabled={product.stock === 0}
            />

            <Button
              icon="pi pi-shopping-cart"
              className="p-button-rounded"
              disabled={product.stock === 0}
              onClick={() => {
                handleAddToCartButton(
                  product,
                  _quantity,
                  selectedClient || client[0]
                );
              }}
            ></Button>
          </div>
        </div>
      </div>
    );
  };

  const itemTemplate = (product, layout) => {
    if (!product) {
      return;
    }

    if (layout === "list") return listItem(product);
    else if (layout === "grid") return gridItem(product);
  };

  const handleClientChange = (e) => {
    setSelectedClient(e.value);
  };

  const header = () => {
    return (
      <div className="flex justify-content-between">
        <Dropdown
          options={client}
          value={selectedClient || client[0]}
          optionLabel="fullname"
          placeholder="Select a Client"
          onChange={(e) => handleClientChange(e.target)}
          className="w-full sm:w-14rem"
        />
        <DataViewLayoutOptions
          layout={layout}
          onChange={(e) => setLayout(e.value)}
        />
      </div>
    );
  };

  return (
    <div className="surface-card shadow-3 border-round p-4">
      <Toast ref={toast} />
      <DataView
        value={inventory}
        itemTemplate={itemTemplate}
        layout={layout}
        header={header()}
      />
    </div>
  );
}

export default OrderMenu;
