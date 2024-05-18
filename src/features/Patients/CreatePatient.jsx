import Joi from "joi-browser";
import PocketBase from 'pocketbase';
import { confirmDialog } from "primereact/confirmdialog";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import CustDropdown from "../../common/components/Dropdown";
import Input from "../../common/components/Input";

const pb = new PocketBase('https://vet-clinic-syst.pockethost.io');


export default function CreatePatient() {
  const [patientDetails, setPatientDetails] = useState("");
  const [client, setClient] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [errors, setErrors] = useState("");
  const [file, setFile] = useState(null);
  const [fileDataURL, setFileDataURL] = useState(null);
  const toast = useRef(null);

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
    name: Joi.string().required().empty("").label("Name of Pet"),
    age: Joi.string().required().empty("").label("Age"),
    breed: Joi.string().required().empty("").label("Breed"),
    weight: Joi.string().required().empty("").label("Weight"),
    gender: Joi.string()
      .valid("Male", "Female")
      .required()
      .empty("")
      .label("Gender"),
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(patientDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const submitForm = async () => {
    try {
      const _patientDetails = { ...patientDetails };
      _patientDetails["base64Data"] = fileDataURL;
      _patientDetails["client"] = selectedClient.id;

      pb.collection('patient').create(_patientDetails);

      toastSuccess("created");
    } catch (ex) {
      console.log(ex);
      const message = "An unexpected error occured";
      toastError(message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validate();
    setErrors(error || {});
    if (error && !error.base64Data) {
      return toastError("An unexpected error occured");
    }
    submitForm();
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

  const handleChange = ({ currentTarget: input }) => {
    const error = { ...errors };
    const errorMessage = validateProperty(input);
    if (errorMessage) error[input.name] = errorMessage;
    else delete error[input.name];

    const _patient = { ...patientDetails };
    _patient[input.name] = input.value;
    setPatientDetails(_patient);
    setErrors(error);
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

  return (
    <div className="surface-section shadow-3 border-round px-4 py-4 md:px-6 ">
      <Toast ref={toast} />
      <div className="flex flex-column">
        <h1 className="mb-3">Create Patient</h1>
        <div className="flex justify-content-between flex-column md:flex-row">
          <p className="m-0 p-0 text-600 mb-2">
            Fill in the following fields to create a new patient.
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
                  value={patientDetails.name || ""}
                  label="Name of Pet"
                  onChange={(e) => handleChange(e, "name")}
                  error={errors.name}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-calendar"
                  name="age"
                  value={patientDetails.age || ""}
                  label="Age"
                  onChange={(e) => handleChange(e, "age")}
                  error={errors.age}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-paw"
                  name="breed"
                  value={patientDetails.breed || ""}
                  label="Breed"
                  onChange={(e) => handleChange(e, "breed")}
                  error={errors.breed}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-venus-mars"
                  name="gender"
                  value={patientDetails.gender || ""}
                  label="Gender"
                  onChange={(e) => handleChange(e, "gender")}
                  error={errors.gender}
                />
              </div>

              <div className="field mb-4 col-6 md:col-6">
                <Input
                  type="text"
                  icon="fas fa-weight-hanging"
                  name="weight"
                  value={patientDetails.weight || ""}
                  label="Weight"
                  onChange={(e) => handleChange(e, "weight")}
                  error={errors.weight}
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

              <div className="field mb-4 col-6 md:col-6">
                <label htmlFor="image" className="text-900 font-medium mb-2">
                  Patient Image
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
