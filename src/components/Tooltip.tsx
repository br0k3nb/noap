import { ReactNode } from "react"

type Props = {
    children: ReactNode
    text: string;
    position:  "left" | "right" | "bottom" | "top";
    customClassName?: string;
}

export default function Tooltip({ children, text, customClassName, position }: Props) {
    const defaultClassName = 'tooltip-' + position + ' ' + 'tooltip-' + position + '-color-controller';

    return (
        <>
            {innerWidth > 640 ? (
                <div className={"tooltip " + defaultClassName + ` ${customClassName && customClassName}`} data-tip={text}>
                    {children}
                </div>
            ): children}
        </>
    )
}