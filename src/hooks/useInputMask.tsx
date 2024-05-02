import { useRef, useCallback, useEffect } from 'react';

export const useInputMask = (mask = '') => {
  const inputRef = useRef<null | HTMLInputElement>(null);

  const onKeyUp = useCallback(() => {
    if (!inputRef.current || !mask) return;

    const separators = mask.match(/([^a-zA-Z0-9\*])/g) || [];

    const regex = new RegExp(
      mask
        .replace(/([^a-zA-Z0-9\*])/g, '-')
        .split('-')
        .reduce((acc, curr) => {
          if (/^[0-9]/.test(mask)) {
            acc = acc.concat(`([0-9]{${curr.length}})`);
            return acc;
          }
          if (/^[a-zA-Z]/.test(mask)) {
            acc = acc.concat(`([a-zA-Z]{${curr.length}})`);
            return acc;
          }
          return '/ /g';
        }, ''),
      'g'
    );

    const replacer = mask
      .replace(/([^a-zA-Z0-9\*])/g, '-')
      .split('-')
      .reduce((acc, _, index) => {
        acc = acc.concat(`$${index + 1}${separators[index] || ''}`);
        return acc;
      }, '');

    if (/^[0-9]/.test(mask)) inputRef.current.value = inputRef.current.value.replace(/[^0-9]/g, '');
    if (/^[a-zA-Z]/.test(mask)) inputRef.current.value = inputRef.current.value.replace(/[^a-zA-Z]/g, '');

    inputRef.current.value = inputRef.current.value
      .substring(0, mask.replace(/([^a-zA-Z0-9\*])/g, '').length)
      .replace(regex, replacer);
  }, [inputRef.current, mask]);

  useEffect(() => {
    if (!inputRef.current) return;

    inputRef.current.focus();
    inputRef.current.setAttribute('placeholder', mask);
  }, [inputRef.current]);

  return { ref: inputRef, onKeyUp, inputRef };
};