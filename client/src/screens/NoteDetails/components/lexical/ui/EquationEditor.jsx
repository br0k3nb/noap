import "./EquationEditor.css";

export default function EquationEditor({
  equation,
  setEquation,
  inline,
  inputRef,
}) {
  const onChange = (event) => {
    setEquation(event.target.value);
  };

  const props = {
    equation,
    inputRef,
    onChange,
  };

  return inline ? (
    <InlineEquationEditor {...props} inputRef={inputRef} />
  ) : (
    <BlockEquationEditor {...props} inputRef={inputRef} />
  );
}
function InlineEquationEditor({ equation, onChange, inputRef }) {
  return (
    <span className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">$</span>
      <input
        className="EquationEditor_inlineEditor"
        value={equation}
        onChange={onChange}
        autoFocus={true}
        ref={inputRef}
      />
      <span className="EquationEditor_dollarSign">$</span>
    </span>
  );
}

function BlockEquationEditor({ equation, onChange, inputRef }) {
  return (
    <div className="EquationEditor_inputBackground">
      <span className="EquationEditor_dollarSign">{"$$\n"}</span>
      <textarea
        className="EquationEditor_blockEditor"
        value={equation}
        onChange={onChange}
        ref={inputRef}
      />
      <span className="EquationEditor_dollarSign">{"\n$$"}</span>
    </div>
  );
}