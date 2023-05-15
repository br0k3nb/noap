import "./Input.css";

type Props = Readonly<{
  'data-test-id'?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
}>;

export default function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  'data-test-id': dataTestId,
}: Props): JSX.Element {
  return (
    <div className="Input__wrapper">
      <label className="Input__label !text-gray-200 text-xs uppercase tracking-widest">{label}</label>
      <input
        type="text"
        className="Input__input !bg-gray-q700 placeholder:text-xs placeholder:uppercase placeholder:tracking-widest"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-test-id={dataTestId}
      />
    </div>
  );
}