import { ReactNode, useContext } from "react";
import { NavbarContext } from "../../../../Home";

import "./Placeholder.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Placeholder({ children, className }: Props): JSX.Element {
  const navContext = useContext(NavbarContext);

  return <div className={className || `Placeholder__root ${navContext?.navbar && '!left-[570px]'}`}>{children}</div>;
}