import { Dropdown } from "primereact";

const CustDropdown = ({
  name,
  value,
  label,
  onChange,
  options,
  optionLabel,
  placeholder,
  error,
  ...rest
}) => {
  return (
    <div>
      <label htmlFor={name} className="text-900 font-medium mb-2">
        {label}
      </label>
      <Dropdown
        {...rest}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={options}
        optionLabel={optionLabel}
        className={`${error ? "p-invalid" : null} w-full mt-2`}
      />
      {error && <div className="text-center p-error">{error}</div>}
    </div>
  );
};

export default CustDropdown;
