import { ReactNode, useContext } from "react";
import { NavbarContext } from "../../../../Home";
import { ExpandedContext } from "../../..";

import "./Placeholder.css";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function Placeholder({
  children,
  className,
}: Props): JSX.Element {
  const navContext = useContext(NavbarContext);
  const expandedCtx = useContext(ExpandedContext);

  return (
    <div
      className={
        className ||
        `Placeholder__root text-gray-400
        ${navContext?.navbar && !expandedCtx?.expanded ? "!left-[570px]" :
        expandedCtx?.expanded && "!left-[30px]"}
        `
      }
    >
      {children}
    </div>
  );
}
