import "./Input.css";

type Props = Readonly<{
  'data-test-id'?: string;
  accept?: string;
  label: string;
  onChange: (files: FileList | null) => void;
  inputWrapperClassName?: string;
}>;

export default function FileInput({ accept, label, onChange, 'data-test-id': dataTestId, inputWrapperClassName }: Props) {
  return (
    <div className="mt-1">
      <div className="flex flex-row justify-between">
        <label className="text-gray-900 dark:!text-gray-200 text-xs uppercase tracking-widest">{label}</label>
        {accept === "image/*" && (
          <p className="text-red-500 uppercase text-xs tracking-widest mb-3">Maximum size of 5mb</p>
        )}
      </div>
      <div className="Input__wrapper">
          <input  
            className={`
              bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 w-full file-input file-input-md file:text-gray-200 file:bg-gray-900 hover:file:bg-black file:font-normal file:text-xs uppercase tracking-widest text-xs rounded-lg pr-12
              ${inputWrapperClassName ? inputWrapperClassName : "max-w-xs"}
            `}
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files)} 
            data-test-id={dataTestId} 
          />
      </div>
    </div>
  );
}