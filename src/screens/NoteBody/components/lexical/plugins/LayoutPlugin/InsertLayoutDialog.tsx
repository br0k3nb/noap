import { useState } from 'react';

import { LexicalEditor } from 'lexical';
import { INSERT_LAYOUT_COMMAND } from './LayoutPlugin';

const LAYOUTS = [
  { label: '2 columns (equal width)', value: '1fr 1fr' },
  { label: '2 columns (25% - 75%)', value: '1fr 3fr '},
  { label: '3 columns (equal width)', value: '1fr 1fr 1fr' },
  { label: '3 columns (25% - 50% - 25%)', value: '1fr 2fr 1fr' },
  { label: '4 columns (equal width)', value: '1fr 1fr 1fr 1fr '},
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0].value);
  const buttonLabel = LAYOUTS.find((item) => item.value === layout)?.label;

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <div className='flex flex-col space-y-5 w-[260px]'>
      <div className="dropdown dropdown-bottom">
        <div 
          tabIndex={0} 
          role="button"
          className="rounded-xl text-center py-2 text-base font-normal normal-case border border-gray-600 w-full text-[16px] bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:bg-[#cacaca] text-gray-900 dark:text-gray-300"
        >
          {buttonLabel}
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow rounded-box w-52 bg-[#dbdbdb] dark:bg-[#181818] border border-gray-600 ">
          {LAYOUTS.map(({ label, value }) => (
            <li key={value} onClick={() => setLayout(value)} className='dark:hover:!bg-[#222222] hover:bg-[#cacaca] rounded-lg'>
              <p className='!text-gray-900 dark:!text-gray-300'>{label}</p>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={onClick} className='bg-green-600 rounded-full w-full text-white py-[6px] uppercase tracking-widest text-[14px] hover:bg-green-700 transition-colors duration-300 ease-in-out border border-gray-600'>
        Insert
      </button>
    </div>
  );
}