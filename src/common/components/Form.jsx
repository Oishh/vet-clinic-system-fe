import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./Input";

class Form extends Component {
  state = {
    data: {},
    error: {},
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const schema = { [name]: this.schema[name] };

    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleChange = ({ currentTarget: input }) => {
    const error = { ...this.state.error };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) error[input.name] = errorMessage;
    else delete error[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;
    this.setState({ data, error });
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const error = this.validate();
    this.setState({ error: error || {} });
    if (error) return;
    this.submitForm();
  };

  renderInput(name, label, icon, toggleMask, type) {
    const { data, error } = this.state;
    return (
      <Input
        type={type}
        toggleMask={toggleMask}
        icon={icon}
        name={name}
        value={data[name]}
        label={label}
        onChange={this.handleChange}
        error={error[name]}
      />
    );
  }
}
export default Form;
