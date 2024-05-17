import { DataView } from "primereact/dataview";
import Joi from "joi-browser";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import React, { useEffect, useRef, useState } from "react";
import vetService from "../../common/services/vetService";
import Input from "../../common/components/Input";

export default function ManageVeterinarian() {
  const [vets, setVets] = useState([]);
  const [vetDetails, setVetDetails] = useState([]);
  const [newVet, setNewVet] = useState([]);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState([]);
  const toast = useRef(null);

  const fetchVets = async () => {
    try {
      const data = await vetService.retrieveVets();
      const vets = data.data;

      setVets(vets);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchVets();
  }, []);

  const schema = {
    firstname: Joi.string().required().min(2).empty("").label("First Name"),
    lastname: Joi.string().required().min(2).empty("").label("Last Name"),
    contactNumber: Joi.string()
      .regex(/^[0-9]*$/, { name: "number only" })
      .required()
      .min(10)
      .empty("")
      .label("Contact Number"),
    schedule: Joi.string().required().min(2).empty("").label("Schedule"),
    time: Joi.string().required().min(2).empty("").label("Time"),
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(vetDetails, schema, options);
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

    const _client = { ...vetDetails };
    _client[input.name] = input.value;
    setVetDetails(_client);
    setErrors(error);
  };

  const updateClient = async () => {
    try {
      await vetService.updateVet(newVet.id, vetDetails);

      const table = { ...newVet, ...vetDetails };
      updateTable(newVet.id, table);

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
      for (let i = 0; i < vets.length; i++) {
        if (vets[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    };
    const index = findIndexById(id);
    const newVet = [...vets];
    newVet[index] = rowData;
    setVets(newVet);
  };

  const handleDeleteButton = (id) => {
    const accept = () => {
      vetService.deleteVetById(id);

      toastSuccess("deleted");
      const updatedVets = [...vets];

      for (let x = 0; x < updatedVets.length; x++) {
        if (updatedVets[x].id === id) {
          updatedVets.splice(x, 1);
        }
      }

      setVets(updatedVets);
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
      detail: `Veterinarian has been successfully ${detail}.`,
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

  const vetTemplate = (_vets) => {
    return (
      <div className="col-12 md:col-6 xl:col-4 p-3">
        <div className="surface-card shadow-2 border-round p-4">
          <div className="flex border-bottom-1 surface-border pb-4">
            <i className="fas fa-user-md text-blue-600 text-5xl mr-3"></i>
            <div className="flex flex-column align-items-start">
              <span className="text-xl text-900 font-medium mb-1">
                {_vets.firstname + " " + _vets.lastname}
              </span>
              <span className="text-600 font-medium mb-2">
                {_vets.contactNumber}
              </span>
              <div className="flex-wrap mb-3">
                <span className="bg-teal-50 text-teal-400 border-round inline-flex py-1 px-2 text-sm">
                  {_vets.schedule}
                </span>
                <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm">
                  {_vets.time}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-content-between pt-4">
            <button
              aria-label="View"
              className="p-button p-component p-button-outlined p-button-primary w-6 mr-2"
              onClick={() => {
                setEdit(true);
                const { firstname, lastname, contactNumber, schedule, time } =
                  _vets;
                setVetDetails({
                  firstname,
                  lastname,
                  contactNumber,
                  schedule,
                  time,
                });
                setNewVet({ ..._vets });
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-edit"></span>
              <span className="p-button-label p-c">Edit</span>
              <span
                role="presentation"
                className="p-ink"
                style={{ height: "231.828px", width: "231.828px" }}
              ></span>
            </button>
            <button
              aria-label="Follow"
              className="p-button p-component p-button-outlined p-button-danger w-6 ml-2"
              onClick={() => {
                handleDeleteButton(_vets.id);
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-trash"></span>
              <span className="p-button-label p-c">Delete</span>
              <span
                role="presentation"
                className="p-ink"
                style={{ height: "231.828px", width: "231.828px" }}
              ></span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="surface-section shadow-3 border-round p-4">
      <Toast ref={toast} />
      <DataView value={vets} itemTemplate={vetTemplate} />
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
            name="firstname"
            value={vetDetails.firstname}
            label="First Name"
            onChange={(e) => inputChange(e, "firstname")}
            error={errors.firstname}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-user"
            name="lastname"
            value={vetDetails.lastname}
            label="Last Name"
            onChange={(e) => inputChange(e, "lastname")}
            error={errors.lastname}
          />
        </div>
        <div className="field">
          <Input
            icon="fas fa-phone"
            name="contactNumber"
            value={vetDetails.contactNumber}
            label="Contact Number"
            onChange={(e) => inputChange(e, "contactNumber")}
            error={errors.contactNumber}
          />
        </div>
        <div className="field">
          <Input
            name="schedule"
            icon="fas fa-calendar"
            value={vetDetails.schedule}
            label="Schedule"
            onChange={(e) => inputChange(e, "schedule")}
            error={errors.schedule}
          />
        </div>
        <div className="field">
          <Input
            name="time"
            icon="fas fa-clock"
            value={vetDetails.time}
            label="Time"
            onChange={(e) => inputChange(e, "time")}
            error={errors.time}
          />
        </div>
      </Dialog>
    </div>
  );
}
