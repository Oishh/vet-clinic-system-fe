import Joi from "joi-browser";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { DataView } from "primereact/dataview";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import React, { useEffect, useRef, useState } from "react";
import clientService from "../../common/services/clientService";
import Input from "../../common/components/Input";

export default function ManageClients() {
  const [clients, setClients] = useState("");
  const [viewPatients, setViewPatients] = useState([]);
  const [viewAppointments, setViewAppointments] = useState([]);
  const toast = useRef(null);
  const [clientDetails, setClientDetails] = useState([]);
  const [newClient, setNewClient] = useState([]);
  const [view, setView] = useState(false);
  const [viewClient, setViewClient] = useState([]);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState([]);

  const fetchClients = async () => {
    try {
      const data = await clientService.retrieveClients();
      const clients = data.data;
      setClients(clients);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const schema = {
    fullname: Joi.string()
      .regex(/^[^0-9]*$/, { name: "character only" })
      .required()
      .min(2)
      .empty("")
      .label("Full Name"),
    contactNumber: Joi.string()
      .regex(/^[0-9]*$/, { name: "number only" })
      .required()
      .min(10)
      .empty("")
      .label("Contact Number"),
    address: Joi.string().required().min(5).empty("").label("Address"),
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(clientDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setErrors(error || {});
    if (error) return toastError("An unexpected error occured");

    updateClient();
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

    const _client = { ...clientDetails };
    _client[input.name] = input.value;
    setClientDetails(_client);
    setErrors(error);
  };

  const updateClient = async () => {
    try {
      await clientService.updateClient(newClient.id, clientDetails);

      const table = { ...newClient, ...clientDetails };
      updateTable(newClient.id, table);

      setEdit(false);
      toastSuccess("updated");
    } catch (ex) {
      if (ex.response.data.status === 409) {
        const message = ex.response.data.error;
        toastError(message);
      } else {
        setEdit(false);
        const message = "An unexpected error occured";
        toastError(message);
      }
    }
  };

  const updateTable = (id, rowData) => {
    const findIndexById = (id) => {
      let index = -1;
      for (let i = 0; i < clients.length; i++) {
        if (clients[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    };
    const index = findIndexById(id);
    const newClient = [...clients];
    newClient[index] = rowData;
    setClients(newClient);
  };

  const handleDeleteButton = (id) => {
    const accept = () => {
      clientService.deleteClientById(id);

      toastSuccess("deleted");
      const updatedClients = [...clients];

      for (let x = 0; x < updatedClients.length; x++) {
        if (updatedClients[x].id === id) {
          updatedClients.splice(x, 1);
        }
      }

      setClients(updatedClients);
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
      message: "Are you sure you want to delete this client?",
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

  const updateFooterDialog = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setEdit(false);
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

  const viewFooterDialog = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => {
          setView(false);
        }}
        className="p-button-text"
      />
    </div>
  );

  const checkIfAllValuesAreCompleted = (appointments) => {
    const result = appointments.every((element) => {
      if (element.status === "COMPLETED") {
        return true;
      }
    });
    return result;
  };

  const checkAppointment = (appointments) => {
    let _appointmentpush = [];
    if (appointments.length === 0) {
      return (
        <span className="bg-yellow-50 text-yellow-400 border-round inline-flex py-1 px-2 text-sm">
          No pending appointments
        </span>
      );
    } else if (checkIfAllValuesAreCompleted(appointments)) {
      return (
        <span className="bg-yellow-50 text-yellow-400 border-round inline-flex py-1 px-2 text-sm">
          No pending appointments
        </span>
      );
    } else {
      appointments.forEach((data, key) => {
        if (data.status === "IN PROGRESS") {
          _appointmentpush.push(
            <span
              key={key}
              className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm"
            >
              Has an appointment
            </span>
          );
        }
      });
      return _appointmentpush[0];
    }
  };

  const checkViewAppointment = (appointment) => {
    let _appointment = [];

    if (appointment.length === 0) {
      return (
        <span className="bg-yellow-50 text-yellow-400 border-round inline-flex py-1 px-2 text-sm mr-1">
          No pending appointments
        </span>
      );
    } else if (checkIfAllValuesAreCompleted(appointment)) {
      return (
        <span className="bg-yellow-50 text-yellow-400 border-round inline-flex py-1 px-2 text-sm mr-1">
          No pending appointments
        </span>
      );
    } else {
      appointment.forEach((data, key) => {
        if (data.status === "IN PROGRESS") {
          _appointment.push(
            <React.Fragment key={key}>
              <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm mr-1">
                {data.date}
              </span>
              <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm mr-1">
                {convertTime(data.time)}
              </span>
            </React.Fragment>
          );
        }
      });
      return _appointment;
    }
  };

  const checkPatient = (client) => {
    if (client.patients.length === 0) {
      return "No Registered Patient";
    } else {
      if (client.patients.length > 1) {
        return client.patients.length + " pets registered";
      } else {
        return client.patients.length + " pet registered";
      }
    }
  };

  const convertTime = (time) => {
    var appointmentHours = {};
    var appointmentMinutes = {};
    var appointmentTime = {};

    let hours = time;
    if (parseInt(hours) < 10) {
      appointmentHours = hours.slice(0, 2);
    }
    let intHours = parseInt(hours);
    let AmorPm = intHours >= 12 ? "PM" : "AM";
    intHours = intHours % 12 || 12;
    if (intHours < 10) {
      intHours = "0" + intHours;
    }
    appointmentHours = intHours;
    let minutes = time;
    appointmentMinutes = minutes.slice(3, 5);
    let finalTime = appointmentHours + ":" + appointmentMinutes + " " + AmorPm;
    appointmentTime = finalTime;

    return appointmentTime;
  };

  const gridItem = (client) => {
    let _appointment = [...client.appointments];
    return (
      <div className="col-6 p-2">
        <div className="surface-card shadow-2 border-round p-4">
          <div className="flex border-bottom-1 surface-border pb-4 justify-content-between">
            <div className="flex align-items-center gap-2">
              <span className="text-2xl font-bold">{client.fullname}</span>
            </div>
            <div className="flex align-items-center gap-2">
              {checkAppointment(_appointment)}
            </div>
          </div>
          <div className="flex flex-column align-items-left gap-3 py-2">
            <div className="flex-wrap">
              <i className="fas fa-phone mr-2"></i>
              <span className="font-semibold">{client.contactNumber}</span>
            </div>
            <div className="flex-wrap">
              <i className="fas fa-home mr-2"></i>
              <span className="font-semibold">{client.address}</span>
            </div>
            <div className="flex-wrap">
              <i className="fas fa-paw mr-2"></i>
              <span className="font-semibold">{checkPatient(client)}</span>
            </div>
          </div>
          <div className="flex justify-content-between">
            <button
              className="p-button p-component p-button-outlined p-button-primary w-6 ml-2"
              onClick={() => {
                setView(true);
                setViewClient({ ...client });
                setViewPatients({ ...client.patients });
                setViewAppointments([...client.appointments]);
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-search"></span>
              <span className="p-button-label p-c">View</span>
            </button>
            <button
              className="p-button p-component p-button-outlined p-button-secondary w-6 ml-2"
              onClick={() => {
                setEdit(true);
                const { fullname, contactNumber, address } = client;
                setClientDetails({
                  fullname,
                  contactNumber,
                  address,
                });
                setNewClient({ ...client });
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-edit"></span>
              <span className="p-button-label p-c">Edit</span>
            </button>
            <button
              className="p-button p-component p-button-outlined p-button-danger w-6 ml-2"
              onClick={() => {
                handleDeleteButton(client.id);
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-trash"></span>
              <span className="p-button-label p-c">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="content">
      <div className="card">
        <Toast ref={toast} />
        <DataView value={clients} itemTemplate={gridItem} />

        <Dialog
          header="Client Details"
          visible={edit}
          className="p-fluid"
          style={{ width: "50vw" }}
          onHide={() => {
            setEdit(false);
            setErrors({});
          }}
          footer={updateFooterDialog}
        >
          <div className="field">
            <Input
              icon="fas fa-user"
              name="fullname"
              value={clientDetails.fullname}
              label="Full Name"
              onChange={(e) => inputChange(e, "fullname")}
              error={errors.fullname}
            />
          </div>
          <div className="field">
            <Input
              icon="fas fa-phone"
              name="contactNumber"
              value={clientDetails.contactNumber}
              label="Contact Number"
              onChange={(e) => inputChange(e, "contactNumber")}
              error={errors.contactNumber}
            />
          </div>
          <div className="field">
            <Input
              name="address"
              icon="fas fa-home"
              value={clientDetails.address}
              label="Address"
              onChange={(e) => inputChange(e, "address")}
              error={errors.address}
            />
          </div>
        </Dialog>

        <Dialog
          header="Client Details"
          visible={view}
          className="p-fluid"
          style={{ width: "50vw" }}
          onHide={() => {
            setView(false);
          }}
          footer={viewFooterDialog}
        >
          <div className="col-12 p-3">
            <div className="surface-card shadow-2 border-round p-4">
              <div className="flex border-bottom-1 surface-border pb-4">
                <div className="col flex flex-column align-items-start">
                  <div className="flex-wrap mb-3">
                    <i className="fas fa-user mr-2"></i>
                    <span className="font-semibold">{viewClient.fullname}</span>
                  </div>
                  <div className="flex-wrap mb-3">
                    <i className="fas fa-phone mr-2"></i>
                    <span className="font-semibold">
                      {viewClient.contactNumber}
                    </span>
                  </div>
                  <div className="flex-wrap mb-3">
                    <i className="fas fa-home mr-2"></i>
                    <span className="font-semibold">{viewClient.address}</span>
                  </div>
                  <div className="flex-wrap mb-3">
                    <i className="fas fa-paw mr-2"></i>
                    {viewPatients[0] === undefined && (
                      <span className="bg-yellow-50 text-yellow-400 border-round inline-flex py-1 px-2 text-sm mr-1">
                        No Registered Pets
                      </span>
                    )}
                    {Object.entries(viewPatients).map(([key, value]) => (
                      <span
                        className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm mr-1"
                        key={key}
                      >
                        {value.name + " the " + value.breed}
                      </span>
                    ))}
                  </div>
                  <div className="flex-wrap">
                    <i className="fas fa-calendar mr-2"></i>
                    {checkViewAppointment(viewAppointments)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </section>
  );
}
