import Joi from "joi-browser";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import clientService from "../../common/services/clientService";
import Input from "../../common/components/Input";

function CreateClients() {
  const [clientDetails, setClientDetails] = useState("");
  const [errors, setErrors] = useState("");
  const toast = useRef(null);

  const schema = {
    fullname: Joi.string().required().min(5).empty("").label("Full Name"),
    contactNumber: Joi.string()
      .regex(/^[0-9]*$/, { name: "number only" })
      .required()
      .min(10)
      .empty("")
      .label("Contact Number"),
    address: Joi.string().required().min(2).empty("").label("Address"),
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(clientDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const submitForm = async () => {
    try {
      await clientService.createClient(clientDetails);
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
    if (error) return toastError("An unexpected error occured");
    submitForm();
  };

  const handleChange = ({ currentTarget: input }) => {
    const error = { ...errors };
    const errorMessage = validateProperty(input);
    if (errorMessage) error[input.name] = errorMessage;
    else delete error[input.name];
    const _client = { ...clientDetails };
    _client[input.name] = input.value;
    setClientDetails(_client);
    setErrors(error);
  };

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Client has been successfully ${detail}.`,
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
        <h1 className="mb-3">Create Client</h1>
        <div className="flex justify-content-between flex-column md:flex-row">
          <p className="m-0 p-0 text-600 mb-2">
            Fill in the following fields to create a new client.
          </p>
          <div className="flex justify-content-end mt-2"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="col-12">
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-user"
                  name="fullname"
                  value={clientDetails.fullname || ""}
                  label="Full Name"
                  onChange={(e) => handleChange(e, "fullname")}
                  error={errors.fullname}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-phone"
                  name="contactNumber"
                  value={clientDetails.contactNumber || ""}
                  label="Contact Number"
                  onChange={(e) => handleChange(e, "contactNumber")}
                  error={errors.contactNumber}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-home"
                  name="address"
                  value={clientDetails.address || ""}
                  label="Address"
                  onChange={(e) => handleChange(e, "address")}
                  error={errors.address}
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

export default CreateClients;
