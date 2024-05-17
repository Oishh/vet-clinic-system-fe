import Joi from "joi-browser";
import { confirmDialog } from "primereact/confirmdialog";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import inventoryService from "../../common/services/inventoryService";
import Input from "../../common/components/Input";
import InputNum from "../../common/components/InputNumber";

function CreateInventory() {
  const [inventoryDetails, setInventoryDetails] = useState("");
  const [errors, setErrors] = useState("");
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const toast = useRef(null);

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
    name: Joi.string().required().min(2).empty("").label("Product Name"),
    category: Joi.string().required().min(2).empty("").label("Category"),
    stock: Joi.number().required().min(1).empty("").label("Stock"),
    price: Joi.number().required().min(1).empty("").label("Price"),
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(inventoryDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const submitForm = async () => {
    try {
      const _inventoryDetails = { ...inventoryDetails };
      _inventoryDetails["base64Data"] = fileDataURL;

      await inventoryService.createInventory(_inventoryDetails);
      toastSuccess("created");
    } catch (ex) {
      const message = "An unexpected error occured";
      toastError(message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setErrors(error || {});
    const message = "An unexpected error occured";
    if (error) return toastError(message);
    submitForm();
  };

  const handleNumberChange = (e) => {
    const error = { ...errors };
    const errorMessage = validateProperty(e.target);
    if (errorMessage) error[e.target.name] = errorMessage;
    else delete error[e.target.name];
    const _inventory = { ...inventoryDetails };
    _inventory[e.target.name] = e.target.value;
    setInventoryDetails(_inventory);
    setErrors(error);
  };

  const handleChange = ({ currentTarget: input }) => {
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
    const accept = () => {
      toast.current.show({
        severity: "success",
        summary: "Confirmed",
        detail: "File successfully uploaded.",
        life: 500,
      });

      const file = e.files[0];
      setFile(file);
    };

    const reject = () => {
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
      accept: accept,
      reject: reject,
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

  return (
    <div className="surface-section shadow-3 border-round px-4 py-4 md:px-6 ">
      <Toast ref={toast} />
      <div className="flex flex-column">
        <h1 className="mb-3">Create Inventory</h1>
        <div className="flex justify-content-between flex-column md:flex-row">
          <p className="m-0 p-0 text-600 mb-2">
            Fill in the following fields to create a new inventory.
          </p>
          <div className="flex justify-content-end mt-2"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="col-12">
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-tag"
                  name="name"
                  value={inventoryDetails.name || ""}
                  label="Product"
                  onChange={(e) => handleChange(e, "name")}
                  error={errors.name}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-list"
                  name="category"
                  value={inventoryDetails.category || ""}
                  label="Category"
                  onChange={(e) => handleChange(e, "category")}
                  error={errors.category}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <InputNum
                  inputId="stock"
                  label="Stock"
                  name="stock"
                  value={inventoryDetails.stock || 0}
                  onValueChange={(e) => handleNumberChange(e)}
                  mode="decimal"
                  min={0}
                  max={100}
                  error={errors.stock}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <InputNum
                  inputId="price"
                  label="Price"
                  name="price"
                  value={inventoryDetails.price || 0}
                  onValueChange={(e) => handleNumberChange(e)}
                  mode="currency"
                  currency="PHP"
                  min={0}
                  error={errors.price}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <label htmlFor="image" className="text-900 font-medium mb-2">
                  Product Image
                </label>
                <FileUpload
                  name="image"
                  mode="advanced"
                  emptyTemplate={
                    <p className="m-0">
                      Drag and drop files to here to upload.
                    </p>
                  }
                  id="image"
                  accept=".png, .jpg, .jpeg"
                  customUpload
                  uploadHandler={(e) => handleFileChange(e)}
                  auto={true}
                  chooseLabel="Upload"
                />
              </div>

              <div className="col-12">
                <button
                  aria-label="Create Client"
                  className="p-button p-component w-auto mt-3"
                >
                  <span className="p-button-label p-c">Create</span>
                  <span role="presentation" className="p-ink"></span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateInventory;
