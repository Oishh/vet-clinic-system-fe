import Joi from "joi-browser";
import PocketBase from 'pocketbase';
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../common/components/Input";
import logo from "../resources/blue-bubbles-icon.jpg";
import bg from "../resources/vet background.jpg";

const pb = new PocketBase('https://vet-clinic-syst.pockethost.io');

function Login() {
  const [accountDetails, setAccountDetails] = useState("");
  const [errors, setErrors] = useState([]);
  const toast = useRef(null);
  const navigate = useNavigate();

  const schema = {
    username: Joi.string().required().min(2).empty("").label("Username"),
    password: Joi.string().required().min(2).empty("").label("Password"),
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propSchema = { [name]: schema[name] };

    const { error } = Joi.validate(obj, propSchema);
    return error ? error.details[0].message : null;
  };

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(accountDetails, schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  const submitForm = async (e) => {
    try {
      const authData = await pb.admins.authWithPassword(
          accountDetails.username,
          accountDetails.password,
      );

      if (pb.authStore.isValid) {
        navigate("/blue-bubbles/dashboard");
        localStorage.setItem("username", accountDetails.username);
        localStorage.setItem("token", authData.token);
      } else {
        toastError("Invalid Credentials.");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
      }

    } catch (ex) {
      toastError("An unexpected error occured");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
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
    const _account = { ...accountDetails };
    _account[input.name] = input.value;
    setAccountDetails(_account);
    setErrors(error);
  };

  const toastSuccess = (detail) => {
    toast.current.show({
      severity: "success",
      summary: "Successful",
      detail: `Account has been successfully ${detail}.`,
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
    <div>
      <Toast ref={toast} />
      <div
        className="flex justify-content-center align-items-center min-h-screen bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url("${bg}")` }}
      >
        <Card className="card lg:w-3 shadow-6 sm:my-4 pb-4 px-3">
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <img src={logo} alt="logo" className="h-5rem border-circle" />
              <div className="text-900 text-3xl font-medium">Blue Bubbles</div>
            </div>
            <div className="p-fluid">
              <div className="p-field mb-4">
                <Input
                  type="text"
                  icon="fas fa-user"
                  name="username"
                  value={accountDetails.username || ""}
                  label="Username"
                  onChange={(e) => handleChange(e, "username")}
                  error={errors.username}
                />
              </div>
              <div className="mb-4">
                <Input
                  type="password"
                  icon="fas fa-key"
                  name="password"
                  value={accountDetails.password || ""}
                  label="Password"
                  onChange={(e) => handleChange(e, "password")}
                  toggleMask={true}
                  error={errors.password}
                />
              </div>
              <div className="input-div">
                <Button
                  label="Sign In"
                  icon="fas fa-user"
                  className="p-button-info"
                />
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Login;
