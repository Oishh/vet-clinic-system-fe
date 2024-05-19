import Joi from "joi-browser";
import PocketBase from 'pocketbase';
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { DataView } from "primereact/dataview";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload } from "primereact/fileupload";
import { Image } from "primereact/image";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Input from "../../common/components/Input";

const pb = new PocketBase('https://vet-clinic-syst.pockethost.io');

export default function ManagePatient() {
  const [patient, setPatient] = useState("");
  const [client, setClients] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [patientDetails, setPatientDetails] = useState([]);
  const [newPatient, setNewPatient] = useState([]);
  const [viewPatient, setViewPatient] = useState([]);
  const [viewClient, setViewClient] = useState([]);
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const [view, setView] = useState(false);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState([]);
  const toast = useRef(null);

  const fetchPatients = async () => {
    try {
      const data = await pb.collection('patient').getFullList({
          sort: '-created',
      });
      setPatient(data);
      // console.log(data);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  const fetchClients = async () => {
    try {
      const data = await pb.collection('client').getFullList({
        sort: '-created',
    });

      setClients(data);
      console.log(data);
    } catch (error) {
      toastError("An unexpected error occured");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchClients();
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
    name: Joi.string()
      .regex(/^[^0-9]*$/, { name: "character only" })
      .required()
      .min(2)
      .empty("")
      .label("Name of Pet"),
    age: Joi.string().required().min(2).empty("").label("Age"),
    breed: Joi.string().required().min(2).empty("").label("Breed"),
    weight: Joi.string().required().min(2).empty("").label("Weight"),
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(patientDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setErrors(error || {});
    if (error && !error.fullname && !error.base64Data) {
      return toastError("An unexpected error occured");
    }

    updatePatient();
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

    const _patient = { ...patientDetails };
    _patient[input.name] = input.value;
    setPatientDetails(_patient);
    setErrors(error);
  };

  const updatePatient = async () => {
    try {
      if (fileDataURL != null) {
        const _patientDetails = { ...patientDetails };
        _patientDetails["base64Data"] = fileDataURL;
        _patientDetails["client"] = selectedClient.id;

        if (selectedClient !== "") {
          await pb.collection('patient').update(newPatient.id, _patientDetails);

          const table = { ...newPatient, ..._patientDetails };
          table.fullname = selectedClient.fullname;
          updateTable(newPatient.id, table);
        } else {
          const _patientDetails = { ...patientDetails };
          _patientDetails["client"] = newPatient.client.id;
          await pb.collection('patient').update(newPatient.id, _patientDetails);

          const table = { ...newPatient, ..._patientDetails };
          updateTable(newPatient.id, table);
        }

        const table = { ...newPatient, ..._patientDetails };
        updateTable(newPatient.id, table);
      } else {
        if (selectedClient !== "") {
          const _patientDetails = { ...patientDetails };
          _patientDetails["client"] = selectedClient.id;

          await pb.collection('patient').update(newPatient.id, _patientDetails);

          const table = { ...newPatient, ..._patientDetails };
          table.fullname = selectedClient.fullname;
          updateTable(newPatient.id, table);
        } else {
          const _patientDetails = { ...patientDetails };
          _patientDetails["client"] = newPatient.client.id;
          await pb.collection('patient').update(newPatient.id, _patientDetails);

          const table = { ...newPatient, ..._patientDetails };
          updateTable(newPatient.id, table);
        }
      }

      setEdit(false);
      toastSuccess("updated");
    } catch (ex) {
      console.log(ex);
      setEdit(false);
      const message = "An unexpected error occured";
      toastError(message);
    }
  };

  const updateTable = (id, rowData) => {
    const findIndexById = (id) => {
      let index = -1;
      for (let i = 0; i < patient.length; i++) {
        if (patient[i].id === id) {
          index = i;
          break;
        }
      }
      return index;
    };
    const index = findIndexById(id);
    const newPatient = [...patient];
    newPatient[index] = rowData;
    setPatient(newPatient);
  };

  const handleDeleteButton = (id) => {
    const accept = async () => {
      await pb.collection('patient').delete(id);
      toastSuccess("deleted");
      const updatedPatients = [...patient];

      for (let x = 0; x < updatedPatients.length; x++) {
        if (updatedPatients[x].id === id) {
          updatedPatients.splice(x, 1);
        }
      }

      setPatient(updatedPatients);
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

  const getClientName = (clientId) => {
    for (let i = 0; i < client.length; i++) {
      if(client[i].id === clientId) {
        console.log(client[i].fullname);
        return client[i].fullname;
      }      
    }
  };

  const gridItem = (patient) => {
    return (
      <div className="col-6 p-2">
        <div className="surface-card shadow-2 border-round p-4">
          <div className="flex border-bottom-1 surface-border pb-4">
            <img
              src={patient.base64Data}
              className="mr-3"
              alt="1"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div className="flex flex-column align-items-start">
              <span className="text-xl text-900 font-medium mb-1">
                {patient.name}
              </span>
              <span className="text-600 font-medium mb-2">{patient.breed}</span>
              <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm">
                {getClientName(patient.client)}
              </span>
            </div>
          </div>
          <div className="flex justify-content-between pt-4">
            <button
              aria-label="View"
              className="p-button p-component p-button-outlined p-button-primary w-6 mr-2"
              onClick={() => {
                setView(true);
                setViewClient(getClientName(patient.client));
                setViewPatient({ ...patient });
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-search"></span>
              <span className="p-button-label p-c">View</span>
            </button>
            <button
              aria-label="Follow"
              className="p-button p-component p-button-outlined p-button-secondary w-6 ml-2"
              onClick={() => {
                setEdit(true);
                const fullname = getClientName(patient.client);
                const { name, age, breed, base64Data, weight } = patient;
                setPatientDetails({
                  fullname,
                  name,
                  age,
                  breed,
                  base64Data,
                  weight,
                });
                setNewPatient({ ...patient });
              }}
            >
              <span className="p-button-icon p-c p-button-icon-left fas fa-edit"></span>
              <span className="p-button-label p-c">Edit</span>
            </button>
            <button
              className="p-button p-component p-button-outlined p-button-danger w-6 ml-2"
              onClick={() => {
                handleDeleteButton(patient.id);
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

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Patient has been successfully ${detail}.`,
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
        disabled={selectedClient === ""}
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

  return (
    <section className="content">
      <Toast ref={toast} />
      <div className="card">
        <DataView value={patient} itemTemplate={gridItem} />

        <Dialog
          header="Patient Details"
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
              name="name"
              value={patientDetails.name}
              label="Name of Pet"
              onChange={(e) => inputChange(e, "name")}
              error={errors.name}
            />
          </div>
          <div className="field">
            <Input
              icon="fas fa-calendar"
              name="age"
              value={patientDetails.age}
              label="Age"
              onChange={(e) => inputChange(e, "age")}
              error={errors.age}
            />
          </div>
          <div className="field">
            <Input
              icon="fas fa-clock"
              name="breed"
              value={patientDetails.breed}
              label="Breed"
              onChange={(e) => inputChange(e, "breed")}
              error={errors.breed}
            />
          </div>
          <div className="field">
            <Input
              icon="fas fa-weight-hanging"
              name="weight"
              value={patientDetails.weight}
              label="Weight"
              onChange={(e) => inputChange(e, "weight")}
              error={errors.weight}
            />
          </div>
          <div className="field">
            <p style={{ fontWeight: "500" }}>Image</p>
            <div className="grid formgrid p-fluid">
              <div className="field col-2">
                <Image
                  src={fileDataURL || patientDetails.base64Data}
                  zoomSrc={fileDataURL || patientDetails.base64Data}
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

        <Dialog
          header="Patient Details"
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
                <img
                  src={viewPatient.base64Data}
                  className="mr-4"
                  alt="1"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div className="col flex flex-column align-items-start">
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-tag mr-2"></i>
                    {viewPatient.name}
                  </span>
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-hourglass-half mr-2"></i>
                    {viewPatient.age}
                  </span>
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-venus-mars mr-2"></i>
                    {viewPatient.gender}
                  </span>
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-paw mr-2"></i>
                    {viewPatient.breed}
                  </span>
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-weight-hanging mr-2"></i>
                    {viewPatient.weight}
                  </span>
                  <span className="text-1000 flex-wrap font-medium mb-2">
                    <i className="fas fa-user mr-2"></i>
                    <span className="bg-blue-50 text-blue-400 border-round inline-flex py-1 px-2 text-sm">
                      {viewClient}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </div>
    </section>
  );
}
