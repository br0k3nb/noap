import katex from "katex";
import { useEffect, useRef } from "react";

export default function KatexRenderer({
  equation,
  inline,
}: Readonly<{
  equation: string;
  inline: boolean;
}>): JSX.Element {
  const katexElementRef = useRef(null);

  useEffect(() => {
    const katexElement = katexElementRef.current;

    if (katexElement) {
      katex.render(equation, katexElement, {
        displayMode: !inline,
        errorColor: "#cc0000",
        output: "html",
        strict: "warn",
        throwOnError: false,
        trust: false,
      });
    }
  }, [equation, inline]);

  return (
    <>
      <span className="spacer" />
      <p ref={katexElementRef} />
      <span className="spacer" />
    </>
  );
}
