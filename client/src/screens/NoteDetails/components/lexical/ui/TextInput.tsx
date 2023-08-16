import "./Input.css";

type Props = Readonly<{
  'data-test-id'?: string;
  label: string;
  onChange: (val: string) => void;
  placeholder?: string;
  value: string;
}>;

export default function TextInput({ label, value, onChange, placeholder = '', 'data-test-id': dataTestId }: Props) {
  return (
    <div className="Input__wrapper dark:!text-gray-300 !text-gray-900">
      <label className="Input__label dark:!text-gray-300 !text-gray-900 text-xs uppercase tracking-widest">{label}</label>
      <input
        type="text"
        className="Input__input !bg-[#c1c1c1] dark:!bg-[#323232] placeholder:text-xs placeholder:uppercase placeholder:tracking-widest"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-test-id={dataTestId}
      />
    </div>
  );
}