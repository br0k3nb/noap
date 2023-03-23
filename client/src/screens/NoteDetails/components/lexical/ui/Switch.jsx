import { useMemo } from "react";

export default function Switch({ checked, onClick, text, id }) {
  const buttonId = useMemo(() => "id_" + Math.floor(Math.random() * 10000), []);

  return (
    <div className="switch" id={id}>
      <label htmlFor={buttonId}>{text}</label>
      <button
        role="switch"
        aria-checked={checked}
        id={buttonId}
        onClick={onClick}
      >
        <span />
      </button>
    </div>
  );
}
