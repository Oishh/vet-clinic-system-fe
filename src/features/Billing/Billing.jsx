import { confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import clientService from "../../common/services/clientService";
import orderService from "../../common/services/orderService";

export default function Billing() {
  const toast = useRef(null);
  const [invoiceForClient, setInvoiceForClient] = useState(null);
  const [client, setClient] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const componentRef = useRef();

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

  const fetchOrders = async () => {
    if (client) {
      try {
        const data = await orderService.retrieveOrderForClient(
          selectedClientId || client[0].id
        );
        const orders = data.data;
        var inProgressOrders = [];
        for (let x = 0; x < orders.length; x++) {
          if (orders[x].status === "INPROGRESS") {
            inProgressOrders[x] = orders[x];
          }
        }
        setInvoiceForClient(inProgressOrders);
      } catch (error) {
        toastError("An unexpected error occured");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [client, selectedClientId]);

  const handleClientChange = (e) => {
    setSelectedClientId(e.value.id);
    setSelectedClient(e.value);
  };

  const handleConfirmButton = (order, orderNum, timestamp) => {
    const accept = async () => {
      try {
        let _order = { ...order };
        let _orderNum = { orderNumber: orderNum };
        let _timestamp = { confirmed_timestamp: timestamp };

        for (let x = 0; x < order.length; x++) {
          if (order[x]) {
            _order[x].orderNumber = orderNum;
            _order[x].confirmed_timestamp = timestamp;

            if (_order[x].orderNumber !== null) {
              await orderService.updateOrderNumber(order[x].id, _orderNum);
            }
            if (_order[x].confirmed_timestamp !== null) {
              await orderService.updateTimestamp(order[x].id, _timestamp);
            }
            if (
              _order[x].confirmed_timestamp !== null ||
              _order[x].orderNumber !== null
            ) {
              await orderService.confirmOrderStatus(order[x].id);
            }
          }
        }

        window.location.reload();
      } catch (ex) {
        console.log(ex);
        toastError("An unexpected error occured");
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
      message: `Confirm order no. ${orderNum}?`,
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      position: "top",
      accept,
      reject,
    });
  };

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Order has been successfully ${detail}.`,
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

  const showInvoice = () => {
    let _order = [];
    let _inventory = [];
    let _client = [];
    let _total = 0;
    if (invoiceForClient) {
      for (let x = 0; x < invoiceForClient.length; x++) {
        if (invoiceForClient[x]) {
          _inventory[x] = invoiceForClient[x].inventory;
          _inventory[x]["quantity"] = invoiceForClient[x].quantity;
          _client = invoiceForClient[x].client;
          _order[x] = invoiceForClient[x];
        }
      }
    }

    if (
      invoiceForClient === null ||
      invoiceForClient.length === 0 ||
      _order.status === "COMPLETED"
    ) {
      return (
        <div className="surface-section px-4 py-5 md:px-6 lg:px-8">
          <div className="flex justify-content-between">
            <span></span>
            <Dropdown
              options={client}
              value={selectedClient || client[0]}
              optionLabel="fullname"
              placeholder="Select a Client"
              onChange={(e) => handleClientChange(e.target)}
              className="w-full sm:w-14rem"
            />
          </div>

          <div className="mt-6 mb-5 font-bold text-6xl text-900 text-center">
            Bill Not Found
          </div>
          <p className="text-700 text-3xl mt-0 mb-6 text-center">
            Sorry, client does not have a pending bill.
          </p>
        </div>
      );
    } else {
      let _orderNum = Object.values(invoiceForClient)[0].id + 40000;
      return (
        <div className="surface-section px-4 py-5 md:px-6 lg:px-8">
          <div className="flex justify-content-between">
            <span className="text-700 text-xl">Thanks!</span>
            <Dropdown
              options={client}
              value={selectedClient || client[0]}
              optionLabel="fullname"
              placeholder="Select a Client"
              onChange={(e) => handleClientChange(e.target)}
              className="w-full sm:w-14rem"
            />
          </div>

          <div className="text-900 font-bold text-4xl mb-2">
            Successful Order 🚀
          </div>
          <p className="text-700 text-xl mt-0 mb-4 p-0">
            Your order is on the way. It‘ll be shipped today. We‘ll inform you.
          </p>
          <div
            style={{
              height: "3px",
              background:
                "linear-gradient(90deg, #2196F3 0%, rgba(33, 150, 243, 0) 50%)",
            }}
          ></div>
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between py-5">
            <div className="mb-3 sm:mb-0">
              <span className="font-medium text-xl text-900 mr-2">
                Order number:
              </span>
              <span className="font-medium text-xl text-blue-500">
                {_orderNum}
              </span>
            </div>
            <div>
              <button
                aria-label="Details"
                className="p-button p-component p-button-outlined p-button-primary mr-2"
                onClick={() => {
                  handleConfirmButton(_order, _orderNum, Date.now());
                }}
              >
                <span className="p-button-icon p-c p-button-icon-left fas fa-check"></span>
                <span className="p-button-label p-c">Confirm</span>
                <span
                  role="presentation"
                  className="p-ink"
                  style={{ height: "117.422px", width: "117.422px" }}
                ></span>
              </button>
            </div>
          </div>
          <div className="border-round surface-border border-1">
            <ul className="list-none p-0 m-0">
              {Object.entries(_inventory).map(([key, value]) => (
                <li
                  className="p-3 border-bottom-1 surface-border flex align-items-start sm:align-items-center"
                  key={key}
                >
                  <img
                    src={value.base64Data}
                    className="w-3rem sm:w-8rem flex-shrink-0 mr-3 shadow-2"
                    alt="product"
                  />
                  <div className="flex flex-column">
                    <span className="text-900 font-medium text-xl mb-2">
                      {value.name}
                    </span>
                    <span className="text-600 mb-3">{value.category}</span>
                    <span className="text-900 font-medium">
                      Quantity {value.quantity}
                    </span>
                  </div>
                  <span className="text-900 font-medium text-lg ml-auto">
                    ₱{value.price * value.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap mt-5 pb-3">
            <div className="w-full lg:w-6 pl-3">
              <span className="font-medium text-900">Client Information</span>
              <div className="flex flex-column text-900 mt-3">
                <span className="mb-1">{_client.fullname}</span>
                <span className="mb-1">{_client.address}</span>
                <span className="mb-2">{_client.contactNumber}</span>
              </div>
            </div>
            <div className="w-full lg:w-6 pl-3 lg:pl-0 lg:pr-3 flex align-items-end mt-5 lg:mt-0">
              <ul className="list-none p-0 m-0 w-full">
                <li className="mb-3">
                  <span className="font-medium text-900">Summary</span>
                </li>
                <li className="flex justify-content-between mb-3">
                  <span className="text-900">Subtotal</span>
                  {Object.entries(invoiceForClient).map(([key, value]) => {
                    _total = _total + value.inventory.price * value.quantity;
                  })}
                  <span className="text-900 font-medium text-lg">
                    ₱{_total}
                  </span>
                </li>
                <li className="flex justify-content-between border-top-1 surface-border py-3">
                  <span className="text-900 font-medium">Total</span>
                  <span className="text-900 font-bold text-lg">₱{_total}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      {showInvoice()}
    </div>
  );
}
