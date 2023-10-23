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
      <label className="Input__label dark:!text-gray-300 !text-gray-900 text-[13px] uppercase tracking-widest">{label}</label>
      <input
        type="text"
        className="Input__input !bg-[#ffffff] dark:!bg-[#323232] placeholder:text-xs placeholder:uppercase placeholder:tracking-widest outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-test-id={dataTestId}
      />
    </div>
  );
}