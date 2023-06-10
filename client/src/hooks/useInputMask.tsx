import { useState, useCallback, useEffect } from 'react';

export const useInputMask = (mask = '') => {
  const [inputEl, setInputEl] = useState<null | HTMLInputElement>(null);

  const ref = useCallback((node: HTMLInputElement) => {
    if (node) setInputEl(node);
  }, []);

  const onKeyUp = useCallback(() => {
    if (!inputEl || !mask) return;

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

    if (/^[0-9]/.test(mask)) inputEl.value = inputEl.value.replace(/[^0-9]/g, '');
    if (/^[a-zA-Z]/.test(mask)) inputEl.value = inputEl.value.replace(/[^a-zA-Z]/g, '');

    inputEl.value = inputEl.value
      .substring(0, mask.replace(/([^a-zA-Z0-9\*])/g, '').length)
      .replace(regex, replacer);
  }, [inputEl, mask]);

  useEffect(() => {
    if (!inputEl) return;

    inputEl.setAttribute('placeholder', mask);
  }, [inputEl]);

  return { ref, onKeyUp };
};