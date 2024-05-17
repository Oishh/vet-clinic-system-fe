import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Calendar } from "primereact/calendar";

const Input = ({
  name,
  label,
  error,
  icon,
  toggleMask,
  toggleCalendar,
  type,
  ...rest
}) => {
  const [inputType, setInputType] = useState(toggleMask ? "password" : "text");

  const toggleInputType = () => {
    setInputType(inputType === "password" ? "text" : "password");
  };

  if (toggleCalendar) {
    <div>
      <label htmlFor={name} className="text-900 font-medium mb-2">
        {label}
      </label>
      <span className="p-input-icon-left">
        <i className={`${icon} pt-1`} />
        <Calendar
          {...rest}
          type={type}
          id={name}
          name={name}
          // placeholder={label}
          className={`${error ? "p-invalid" : null} mt-2`}
        />
      </span>
      {error && <div className="text-center p-error">{error}</div>}
    </div>;
  }

  if (!toggleMask) {
    return (
      <div>
        <label htmlFor={name} className="text-900 font-medium mb-2">
          {label}
        </label>
        <span className="p-input-icon-left">
          <i className={`${icon} pt-1`} />
          <InputText
            {...rest}
            type={type}
            id={name}
            name={name}
            // placeholder={label}
            className={`${error ? "p-invalid" : null} mt-2`}
          />
        </span>
        {error && <div className="text-center p-error">{error}</div>}
      </div>
    );
  } else {
    return (
      <div>
        <label htmlFor={name} className="text-900 font-medium mb-2">
          {label}
        </label>
        <span className="p-input-icon-left p-input-icon-right">
          <i className={`${icon} pt-1`} />
          <InputText
            {...rest}
            id={name}
            name={name}
            // placeholder={label}
            type={inputType}
            className={`${error ? "p-invalid" : null} mt-2`}
          />
          {toggleMask && (
            <i
              className={`${
                inputType === "text" ? "fas fa-eye" : "fas fa-eye-slash"
              } pt-1`}
              onClick={toggleInputType}
            />
          )}
        </span>
        {error && <div className="text-center p-error">{error}</div>}
      </div>
    );
  }
};

export default Input;
