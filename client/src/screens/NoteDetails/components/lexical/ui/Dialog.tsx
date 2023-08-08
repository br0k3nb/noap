import { ReactNode } from "react";

import "./Dialog.css";

type Props = Readonly<{
  "data-test-id"?: string;
  children: ReactNode;
  customClassName?: string;
}>;

export function DialogButtonsList({ children, customClassName }: Props): JSX.Element {
  return <div className={`DialogButtonsList ${customClassName}`}>{children}</div>;
}

export function DialogActions({
  "data-test-id": dataTestId,
  children,
}: Props): JSX.Element {
  return (
    <div className="DialogActions" data-test-id={dataTestId}>
      {children}
    </div>
  );
}