import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import orderService from "../../common/services/orderService";

const InvoiceHistory = () => {
  const [invoice, setInvoice] = useState("");
  const [groupedInvoice, setGroupedInvoice] = useState(null);
  const toast = useRef(null);

  const fetchInvoice = async () => {
    try {
      const data = await orderService.retrieveAllOrders();
      const invoices = data.data;
      var finishedInvoice = [];
      for (let x = 0; x < invoices.length; x++) {
        if (invoices[x].status === "COMPLETED") {
          finishedInvoice[x] = invoices[x];
        }
      }
      setInvoice(finishedInvoice);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  useEffect(() => {
    if (invoice) {
      const timestampMap = {};

      for (const _invoice of invoice) {
        const { confirmed_timestamp } = _invoice;
        if (!timestampMap[confirmed_timestamp]) {
          timestampMap[confirmed_timestamp] = [];
        }
      }

      for (const _invoice of invoice) {
        const { confirmed_timestamp } = _invoice;
        timestampMap[confirmed_timestamp].push(_invoice);
      }

      const groupedOrders = Object.values(timestampMap);

      // console.log(groupedOrders);

      setGroupedInvoice(groupedOrders);
    }
  }, [invoice]);


  const toastError = (detail) => {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: `${detail}.`,
      life: 3000,
    });
  };

  const handleTimestamp = (rowData) => {
    var t = new Date(parseInt(rowData[0].confirmed_timestamp));

    return t.toString();
  };

  const handleDetails = (rowData) => {
    let _groupedInvoice = [];
    for (let x = 0; x < rowData.length; x++) {
      _groupedInvoice[x] =
        "{ Product: " +
        rowData[x].inventory.name +
        " , Category: " +
        rowData[x].inventory.category +
        " , Price: " +
        rowData[x].inventory.price +
        " , Quantity: " +
        rowData[x].quantity +
        " , Total: " +
        rowData[x].total +
        " }";
    }

    return _groupedInvoice;
  };

  return (
    <div>
      <section className="surface-card shadow-3 border-round p-4">
        <Toast ref={toast} />
        <DataTable
          value={groupedInvoice}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field="0.orderNumber"
            header="Order Number"
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            header="Details"
            body={handleDetails}
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            header="Timestamp"
            body={handleTimestamp}
            sortable
            style={{ width: "auto" }}
          ></Column>
        </DataTable>
      </section>
    </div>
  );
};

export default InvoiceHistory;
