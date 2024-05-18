import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Calendar } from "primereact/calendar";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
        

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
      <IconField iconPosition="left">
        <InputIcon className={`${icon} pt-1`}/>
        <Calendar
          {...rest}
          type={type}
          id={name}
          name={name}
          // placeholder={label}
          className={`${error ? "p-invalid" : null} mt-2`}
        />
      </IconField>
      {error && <div className="text-center p-error">{error}</div>}
    </div>;
  }

  if (!toggleMask) {
    return (
      <div>
        <label htmlFor={name} className="text-900 font-medium mb-2">
          {label}
        </label>
        <IconField iconPosition="left">
          <InputIcon className={`${icon} pt-1`}/>
          <InputText
            {...rest}
            type={type}
            id={name}
            name={name}
            // placeholder={label}
            className={`${error ? "p-invalid" : null} mt-2`}
          />
        </IconField>
        {error && <div className="text-center p-error">{error}</div>}
      </div>
    );
  } else {
    return (
      <div>
        <label htmlFor={name} className="text-900 font-medium mb-2">
          {label}
        </label>
        <IconField iconPosition="left">
          <InputIcon className={`${icon} pt-1`}/>
          <InputText
            {...rest}
            id={name}
            name={name}
            // placeholder={label}
            type="password"
            className={`${error ? "p-invalid" : null} mt-2`}
          />
        </IconField>
        {error && <div className="text-center p-error">{error}</div>}
      </div>
    );
  }
};

export default Input;
