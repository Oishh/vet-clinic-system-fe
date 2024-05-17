import Joi from "joi-browser";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import appointmentService from "../../common/services/appointmentService";
import clientService from "../../common/services/clientService";
import Input from "../../common/components/Input";

export default function ManageAppointment() {
  const [appointment, setAppointment] = useState(null);
  const [client, setClients] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [visible, setVisible] = useState(false);
  const [newAppointment, setNewAppointment] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState([]);
  const [errors, setErrors] = useState([]);
  const toast = useRef(null);

  const fetchClients = async () => {
    try {
      const data = await clientService.retrieveClients();
      const clients = data.data;
      setClients(clients);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.retrieveAppointments();
      const appointments = data.data;
      let updatedAppointments = { ...appointments };
      var appointmentHours = {};
      var appointmentMinutes = {};
      var appointmentTime = {};

      for (let x = 0; x < appointments.length; x++) {
        let hours = updatedAppointments[x].time;
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
        let minutes = updatedAppointments[x].time;
        appointmentMinutes = minutes.slice(3, 5);
        let finalTime =
          appointmentHours + ":" + appointmentMinutes + " " + AmorPm;
        appointmentTime = finalTime;

        updatedAppointments[x].time = appointmentTime;
      }

      setAppointment(appointments);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
    date: Joi.date().iso().required().min(Date.now()).empty("").label("Date"),
    time: Joi.string().required().min(2).empty("").label("Time"),
    type: Joi.string().required().min(2).empty("").label("Type"),
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(appointmentDetails, schema, options);
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
    updateAppointment();
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

  const updateAppointment = async () => {
    try {
      if (selectedClient !== "") {
        await appointmentService.updateAppointment(
          selectedClient.id,
          newAppointment.id,
          appointmentDetails
        );
        const table = { ...newAppointment, ...appointmentDetails };
        table.client.fullname = selectedClient.fullname;
        updateTable(newAppointment.id, table);
      } else {
        await appointmentService.updateAppointment(
          newAppointment.client.id,
          newAppointment.id,
          appointmentDetails
        );
        const table = { ...newAppointment, ...appointmentDetails };
        updateTable(newAppointment.id, table);
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
      for (let i = 0; i < appointment.length; i++) {
        if (appointment[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    };
    const index = findIndexById(id);
    const newAppointment = [...appointment];
    newAppointment[index] = rowData;
    setAppointment(newAppointment);
  };

  const updateStatus = async (rowData, toastTitle) => {
    try {
      await appointmentService.toggleStatus(rowData.id);
      const updatedAppointmentStatus = { ...rowData };
      if (updatedAppointmentStatus.status === "IN PROGRESS") {
        updatedAppointmentStatus.status = "COMPLETED";
      } else {
        updatedAppointmentStatus.status = "IN PROGRESS";
      }
      updateTable(updatedAppointmentStatus.id, updatedAppointmentStatus);
      toastSuccess(toastTitle);
    } catch (ex) {
      const message = "Error updating record";
      toastError(message);
    }
  };

  const accept = (rowData, optionTitle) => {
    if (optionTitle === "complete") {
      updateStatus(rowData, "completed");
    } else if (optionTitle === "initiate") {
      updateStatus(rowData, "initiated");
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

  const confirmDialogBox = (rowData, optionTitle) => {
    const message =
      optionTitle === "complete"
        ? "complete "
        : optionTitle === "initiate"
        ? "initiate"
        : null;

    confirmDialog({
      message: `Do you want to ${message} the appointment for ${rowData.client.fullname}?`,
      header: "Confirm",
      icon: "pi pi-exclamation-triangle",
      position: "top",
      accept: () => accept(rowData, optionTitle),
      reject,
    });
  };

  const actionButton = (rowData) => {
    return (
      <div className="flex">
        {rowData.status === "IN PROGRESS" && (
          <Button
            onClick={() => confirmDialogBox(rowData, "complete")}
            icon="pi pi-check-circle"
            rounded
            aria-label="Filter"
            className="mr-2"
            severity="success"
            tooltip="Complete"
            tooltipOptions={{ position: "bottom" }}
          />
        )}

        {rowData.status === "COMPLETED" && (
          <Button
            onClick={() => confirmDialogBox(rowData, "initiate")}
            icon="pi pi-ban"
            rounded
            aria-label="Filter"
            className="mr-2"
            severity="danger"
            tooltip="Set In Progress"
            tooltipOptions={{ position: "bottom" }}
          />
        )}

        <Button
          onClick={() => {
            setVisible(true);
            const fullname = rowData.client.fullname;
            const { type, date, time } = rowData;
            setAppointmentDetails({
              fullname,
              type,
              date,
              time,
            });
            setNewAppointment({ ...rowData });
          }}
          icon="pi pi-pencil"
          rounded
          aria-label="Filter"
          className="mr-2"
          tooltip="Update"
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
    <div>
      <section className="surface-card shadow-3 border-round p-4">
        <Toast ref={toast} />
        <DataTable
          value={appointment}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          showGridlines
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            field="client.fullname"
            header="Fullname"
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            field="type"
            header="Type"
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            field="date"
            header="Date"
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            field="time"
            header="Time"
            sortable
            style={{ width: "auto" }}
          ></Column>

          <Column
            field="status"
            header="Status"
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
      </section>

      <Dialog
        header="Appointment Details"
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
          <label htmlFor="client" className="text-900 font-medium mb-2">
            Client
          </label>
          <Dropdown
            name="client"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.value)}
            options={client}
            optionLabel="fullname"
            placeholder="Select a Client"
            className="w-full"
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-edit"
            name="type"
            value={appointmentDetails.type}
            label="Type"
            onChange={(e) => inputChange(e, "type")}
            error={errors.type}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-calendar"
            name="date"
            value={appointmentDetails.date}
            label="Date"
            onChange={(e) => inputChange(e, "date")}
            error={errors.date}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-clock"
            name="time"
            value={appointmentDetails.time}
            label="Time"
            onChange={(e) => inputChange(e, "time")}
            error={errors.time}
          />
        </div>
      </Dialog>
    </div>
  );
}
