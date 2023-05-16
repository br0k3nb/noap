import "./Input.css";

type Props = Readonly<{
  'data-test-id'?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({ accept, label, onChange, 'data-test-id': dataTestId }: Props) {
  return (
    <div className="Input__wrapper">
      <label className="!text-gray-200 text-xs uppercase tracking-widest">{label}</label>
      <div className="form-control pl-7 xxs:pl-5">
        <input 
          className="w-full max-w-xs file-input border border-gray-500 file:text-gray-200 file:bg-gray-700 file:font-normal file:text-xs bg-gray-900 uppercase tracking-widest text-xs"
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files)} 
          data-test-id={dataTestId} 
        />
      </div>
    </div>
  );
}