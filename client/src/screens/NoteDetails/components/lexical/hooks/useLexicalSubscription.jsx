import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMemo, useRef, useState, useLayoutEffect } from 'react';
// import  from 'shared/useLayoutEffect';

export default function useLexicalSubscription(subscription) {
    const [editor] = useLexicalComposerContext();
    const initializedSubscription = useMemo(() => subscription(editor), [editor, subscription]);
    const valueRef = useRef(initializedSubscription.initialValueFn());
    const [value, setValue] = useState(valueRef.current);
    useLayoutEffect(() => {
        const { initialValueFn, subscribe } = initializedSubscription;
        const currentValue = initialValueFn();
        if (valueRef.current !== currentValue) {
            valueRef.current = currentValue;
            setValue(currentValue);
        }
        return subscribe((newValue) => {
            valueRef.current = newValue;
            setValue(newValue);
        });
    }, [initializedSubscription, subscription]);
    return value;
}
