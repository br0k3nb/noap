import "./Dialog.css";

export function DialogButtonsList({ children }) {
  return <div className="DialogButtonsList">{children}</div>;
}

export function DialogActions({ "data-test-id": dataTestId, children }) {
  return (
    <div className="DialogActions" data-test-id={dataTestId}>
      {children}
    </div>
  );
}