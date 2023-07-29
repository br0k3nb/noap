import {useCallback, useState} from 'react';

import Button from '../ui/Button';
import KatexRenderer from './KatexRenderer';

import "./KatexEquationAlterer.css";

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
};

export default function KatexEquationAlterer({
  onConfirm,
  initialEquation = '',
}: Props): JSX.Element {
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
  }, [onConfirm, equation, inline]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <>
      <div className="KatexEquationAlterer_defaultRow">
        Inline
        <input type="checkbox" checked={inline} onChange={onCheckboxChange} />
      </div>
      <div className="KatexEquationAlterer_defaultRow">Equation</div>
      <div className="KatexEquationAlterer_centerRow">
        {inline ? (
          <input onChange={(event) => setEquation(event.target.value)} value={equation} className="KatexEquationAlterer_textArea !bg-gray-700"/>
        ) : (
          <textarea onChange={(event) => setEquation(event.target.value)} value={equation} className="KatexEquationAlterer_textArea !bg-gray-700"/>
        )}
      </div>
      <div className="KatexEquationAlterer_defaultRow">Visualization </div>
      <div className="KatexEquationAlterer_centerRow">
        <KatexRenderer equation={equation} inline={false} onDoubleClick={() => null}/>
      </div>
      <div className="KatexEquationAlterer_dialogActions">
        <Button onClick={onClick} className='!bg-gray-700'>
          Confirm
        </Button>
      </div>
    </>
  );
}