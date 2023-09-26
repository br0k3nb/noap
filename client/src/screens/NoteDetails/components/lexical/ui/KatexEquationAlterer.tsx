import { useCallback, useState } from 'react';

import Button from '../ui/Button';
import KatexRenderer from './KatexRenderer';

import "./KatexEquationAlterer.css";

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({ onConfirm, initialEquation = '' }: Props) {
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <div className="!text-gray-900 dark:!text-gray-300 !w-[20rem]">
      <div className="KatexEquationAlterer_defaultRow uppercase tracking-widest text-xs">
        Inline
        <input 
          type="checkbox" 
          checked={inline} 
          onChange={onCheckboxChange} 
          className='checkbox !h-5 !w-5 border-gray-600'
        />
      </div>
      <div className="KatexEquationAlterer_defaultRow uppercase tracking-widest text-xs !mt-4">Equation</div>
      <div className="KatexEquationAlterer_centerRow !max-w-30">
        {inline ? (
          <input 
            onChange={(event) => setEquation(event.target.value)} 
            value={equation} 
            className="KatexEquationAlterer_textArea text-sm bg-[#ffffff] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#e6e6e6] border border-stone-400 dark:border-[#404040] transition-all duration-300 ease-in-out rounded-lg outline-none"
          />
        ) : (
          <textarea 
            onChange={(event) => setEquation(event.target.value)} 
            value={equation} 
            className="KatexEquationAlterer_textArea text-sm bg-[#ffffff] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#e6e6e6] border border-stone-400 dark:border-[#404040] transition-all duration-300 ease-in-out rounded-lg outline-none"
          />
        )}
      </div>
      <div className="KatexEquationAlterer_defaultRow uppercase text-xs tracking-widest mt-5">Visualization </div>
      <div className="KatexEquationAlterer_centerRow">
        <KatexRenderer
          equation={equation}
          inline={false}
        />
      </div>
      <div className="KatexEquationAlterer_dialogActions">
        <Button 
          onClick={onClick} 
          className="uppercase text-xs tracking-widest py-3  bg-[#dbdbdb] dark:bg-[#181818] dark:hover:!bg-[#222222] hover:!bg-[#cecece] border border-stone-400 dark:border-[#404040] transition-all duration-300 ease-in-out"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}