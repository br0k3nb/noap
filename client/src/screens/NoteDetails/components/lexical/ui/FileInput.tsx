import "./Input.css";

type Props = Readonly<{
  'data-test-id'?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
}>;

export default function FileInput({ accept, label, onChange, 'data-test-id': dataTestId }: Props) {
  return (
    <div className="mt-1">
      <div className="flex flex-row justify-between">
        <label className="!text-gray-200 text-xs uppercase tracking-widest">{label}</label>
        {accept === "image/*" && (
          <p className="text-red-500 uppercase text-xs tracking-widest mb-3">Maximum size of 5mb</p>
        )}
      </div>
      <div className="Input__wrapper ">
          <input  
            className="w-full max-w-xs file-input file-input-md border border-gray-600 file:text-gray-200 file:bg-gray-900 file:font-normal file:text-xs bg-gray-800 uppercase tracking-widest text-xs rounded-lg pr-12"
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files)} 
            data-test-id={dataTestId} 
          />
      </div>
    </div>
  );
}