import Joi from "joi-browser";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import inventoryService from "../../common/services/inventoryService";
import Input from "../../common/components/Input";

export default function ManageInventory() {
  const [inventory, setInventory] = useState(null);
  const [visible, setVisible] = useState(false);
  const [newInventory, setNewInventory] = useState([]);
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const [errors, setErrors] = useState([]);
  const toast = useRef(null);

  const fetchInventory = async () => {
    try {
      const data = await inventoryService.retrieveInventory();
      const inventory = data.data;
      setInventory(inventory);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    let fileReader,
      isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target;
        if (result && !isCancel) {
          setFileDataURL(fileReader.result);
        }
      };
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    };
  }, [file]);

  const schema = {
    name: Joi.string().required().min(2).empty("").label("Product"),
    category: Joi.string().required().min(2).empty("").label("Category"),
    stock: Joi.number().required().min(1).empty("").label("Stock"),
    price: Joi.number().required().min(1).empty("").label("Price"),
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(inventoryDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setErrors(error || {});
    if (error && !error.base64Data) {
      return toastError("An unexpected error occured");
    }

    updateInventory();
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const inputChange = ({ currentTarget: input }) => {
    const error = { ...errors };
    const errorMessage = validateProperty(input);
    if (errorMessage) error[input.name] = errorMessage;
    else delete error[input.name];

    const _inventory = { ...inventoryDetails };
    _inventory[input.name] = input.value;
    setInventoryDetails(_inventory);
    setErrors(error);
  };

  const handleFileChange = (e) => {
    const acceptUpload = () => {
      toast.current.show({
        severity: "success",
        summary: "Confirmed",
        detail: "File successfully uploaded.",
        life: 3000,
      });

      const file = e.files[0];
      setFile(file);
    };

    const rejectUpload = () => {
      toast.current.show({
        severity: "warn",
        summary: "Rejected",
        detail: "You have rejected",
        life: 3000,
      });
      e.options.clear();
    };

    confirmDialog({
      message: "Do you want to upload this image file?",
      header: "Confirm",
      icon: "pi pi-info-circle",
      position: "top",
      accept: acceptUpload,
      reject: rejectUpload,
    });
  };

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Inventory has been successfully ${detail}.`,
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

  const updateInventory = async () => {
    try {
      if (fileDataURL != null) {
        const _inventoryDetails = { ...inventoryDetails };
        _inventoryDetails["base64Data"] = fileDataURL;

        await inventoryService.updateInventory(
          newInventory.id,
          _inventoryDetails
        );

        const table = { ...newInventory, ...inventoryDetails };
        updateTable(newInventory.id, table);
      } else {
        await inventoryService.updateInventory(
          newInventory.id,
          inventoryDetails
        );

        const table = { ...newInventory, ...inventoryDetails };
        updateTable(newInventory.id, table);
      }

      setVisible(false);
      toastSuccess("updated");
    } catch (ex) {
      if (ex.response.data.status === 409) {
        const message = ex.response.data.error;
        toastError(message);
      } else {
        setVisible(false);
        const message = "An unexpected error occured";
        toastError(message);
      }
    }
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
    const newInventory = [...inventory];
    newInventory[index] = rowData;
    setInventory(newInventory);
  };

  const handleDeleteButton = (id) => {
    const accept = () => {
      inventoryService.deleteInventoryById(id);
      toastSuccess("deleted");
      const updatedInventory = [...inventory];

      for (let x = 0; x < updatedInventory.length; x++) {
        if (updatedInventory[x].id === id) {
          updatedInventory.splice(x, 1);
        }
      }

      setInventory(updatedInventory);
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
      message: "Are you sure you want to delete?",
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      position: "top",
      accept,
      reject,
    });
  };

  const actionButton = (rowData) => {
    return (
      <div className="flex">
        <Button
          onClick={() => {
            setVisible(true);
            const { name, category, stock, price, base64Data } = rowData;
            setInventoryDetails({
              name,
              category,
              stock,
              price,
              base64Data,
            });
            setNewInventory({ ...rowData });
          }}
          icon="pi pi-pencil"
          rounded
          aria-label="Filter"
          className="mr-2"
          tooltip="Update"
          tooltipOptions={{ position: "bottom" }}
        />
        <Button
          onClick={() => handleDeleteButton(rowData.id)}
          icon="pi pi-trash"
          rounded
          aria-label="Filter"
          className="mr-2"
          severity="danger"
          tooltip="Delete"
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    );
  };

  const updateFooterDialog = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setVisible(false);
          setErrors({});
        }}
        className="p-button-text"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSubmit}
        autoFocus
      />
    </div>
  );

  return (
    <section className="surface-card shadow-2 border-round p-4">
      <Toast ref={toast} />
      <DataTable
        value={inventory}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        showGridlines
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column
          field="name"
          header="Product"
          sortable
          style={{ width: "auto" }}
        ></Column>

        <Column
          field="category"
          header="Category"
          sortable
          style={{ width: "auto" }}
        ></Column>

        <Column
          field="stock"
          header="Stock"
          sortable
          style={{ width: "auto" }}
        ></Column>

        <Column
          field="price"
          header="Price"
          sortable
          style={{ width: "auto" }}
        ></Column>

        <Column
          header="Action"
          body={actionButton}
          exportable={false}
          style={{ width: "auto" }}
        ></Column>
      </DataTable>

      <Dialog
        header="Inventory Details"
        visible={visible}
        className="p-fluid"
        style={{ width: "50vw" }}
        onHide={() => {
          setVisible(false);
          setErrors({});
        }}
        footer={updateFooterDialog}
      >
        <div className="field">
          <Input
            icon="fas fa-edit"
            name="name"
            value={inventoryDetails.name}
            label="Product"
            onChange={(e) => inputChange(e, "name")}
            error={errors.name}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-calendar"
            name="category"
            value={inventoryDetails.category}
            label="Category"
            onChange={(e) => inputChange(e, "category")}
            error={errors.category}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-clock"
            name="stock"
            value={inventoryDetails.stock}
            label="Stock"
            onChange={(e) => inputChange(e, "stock")}
            error={errors.stock}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-clock"
            name="price"
            value={inventoryDetails.price}
            label="Price"
            onChange={(e) => inputChange(e, "price")}
            error={errors.price}
          />
        </div>
        <div className="field">
          <p style={{ fontWeight: "500" }}>Image</p>
          <div className="grid formgrid p-fluid">
            <div className="field col-2">
              <Image
                src={fileDataURL || inventoryDetails.base64Data}
                zoomSrc={fileDataURL || inventoryDetails.base64Data}
                alt="Image"
                width="80"
                height="60"
                preview
              />
            </div>
            <FileUpload
              className="mt-2"
              mode="basic"
              accept=".png, .jpg, .jpeg"
              customUpload
              uploadHandler={(e) => handleFileChange(e)}
              auto={true}
              chooseLabel="Upload"
            />
          </div>
        </div>
      </Dialog>
    </section>
  );
}
