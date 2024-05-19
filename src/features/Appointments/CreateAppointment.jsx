import Joi from "joi-browser";
import PocketBase from 'pocketbase';
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Input from "../../common/components/Input";
import CustDropdown from "./../../common/components/Dropdown";

const pb = new PocketBase('https://vet-clinic-syst.pockethost.io');

function CreateAppointment() {
  const [appointmentDetails, setAppointmentDetails] = useState("");
  const [client, setClient] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [errors, setErrors] = useState("");
  const toast = useRef(null);

  const schema = {
    date: Joi.date().iso().required().min(Date.now()).empty("").label("Date"),
    time: Joi.string().required().min(2).empty("").label("Time"),
    type: Joi.string().required().min(2).empty("").label("Type"),
  };

  const fetchClients = async () => {
    try {
      const data = await pb.collection('client').getFullList({
          sort: '-created',
      });
      setClient(data);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(appointmentDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const submitForm = async () => {
    try {
      const _appointmentDetails = { ...appointmentDetails };
      _appointmentDetails["status"] = "IN PROGRESS";
      _appointmentDetails["client"] = selectedClient.id;

      await pb.collection('appointment').create(_appointmentDetails);
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
    const _appointment = { ...appointmentDetails };
    _appointment[input.name] = input.value;
    setAppointmentDetails(_appointment);
    setErrors(error);
  };

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Appointment has been successfully ${detail}.`,
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

  const typeArray = [
    "Dental",
    "Surgical",
    "Office Visit",
    "Housecall",
    "Walk-in",
    "Technician",
  ];

  return (
    <div className="surface-section shadow-3 border-round px-4 py-4 md:px-6 ">
      <Toast ref={toast} />
      <div className="flex flex-column">
        <h1 className="mb-3">Create Appointment</h1>
        <div className="flex justify-content-between flex-column md:flex-row">
          <p className="m-0 p-0 text-600 mb-2">
            Fill in the following fields to create a new appointment.
          </p>
          <div className="flex justify-content-end mt-2"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="col-12">
            <div className="grid formgrid p-fluid">
              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="date"
                  icon="fas fa-calendar"
                  name="date"
                  value={appointmentDetails.date || ""}
                  label="Date"
                  onChange={(e) => handleChange(e, "date")}
                  error={errors.date}
                />
              </div>
              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="time"
                  icon="fas fa-clock"
                  name="time"
                  value={appointmentDetails.time || ""}
                  label="Time"
                  onChange={(e) => handleChange(e, "time")}
                  error={errors.time}
                />
              </div>
              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-cog"
                  name="type"
                  value={appointmentDetails.type || ""}
                  label="Type"
                  onChange={(e) => handleChange(e, "type")}
                  error={errors.type}
                />
              </div>
              <div className="field mb-5 col-6 md:col-6">
                <CustDropdown
                  name="client"
                  value={selectedClient}
                  label="Client"
                  onChange={(e) => setSelectedClient(e.value)}
                  options={client}
                  optionLabel="fullname"
                  placeholder="Select a Client"
                  error={errors.client}
                />
              </div>

              <div className="col-12">
                <button
                  aria-label="Create Appointment"
                  className="p-button p-component w-auto"
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

export default CreateAppointment;
