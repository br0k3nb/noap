import "./Input.css";

export default function FileInput({
  accept,
  label,
  onChange,
  "data-test-id": dataTestId,
}) {
  return (
    <div className="Input__wrapper">
      <label className="Input__label">{label}</label>
      <input
        type="file"
        accept={accept}
        className="Input__input"
        onChange={(e) => onChange(e.target.files)}
        data-test-id={dataTestId}
      />
    </div>
  );
}