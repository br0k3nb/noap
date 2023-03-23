import { debounce } from 'lodash-es';
import { useMemo, useRef } from 'react';
export function useDebounce(fn, ms, maxWait) {
    const funcRef = useRef(null);
    funcRef.current = fn;
    return useMemo(() => debounce((...args) => {
        if (funcRef.current) {
            funcRef.current(...args);
        }
    }, ms, { maxWait }), [ms, maxWait]);
}
