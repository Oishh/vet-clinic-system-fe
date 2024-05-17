import { InputNumber } from "primereact/inputnumber";

const InputNum = ({
  name,
  value,
  label,
  icon,
  mode,
  currency,
  min,
  max,
  error,
  onValueChange,
}) => {
  return (
    <div>
      <label htmlFor={name} className="text-900 font-medium mb-2">
        {label}
      </label>
      <span className="p-input-icon-left">
        <i className={`pi ${icon} pt-1`} />
        <InputNumber
          inputId={name}
          name={name}
          value={value}
          onValueChange={onValueChange}
          showButtons
          mode={mode}
          currency={currency}
          allowEmpty={false}
          min={min}
          max={max}
          className={`${error ? "p-invalid" : null} mt-2`}
        />
      </span>
      {error && <div className="text-center p-error">{error}</div>}
    </div>
  );
};

export default InputNum;
