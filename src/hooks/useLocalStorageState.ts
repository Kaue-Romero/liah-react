import { useCallback, useState } from 'react';
import { readJson, writeJson } from '../utils/storage';

export function useLocalStorageState<T>(
  key: string,
  fallback: T
): [T, (next: T | ((current: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readJson<T>(key, fallback));

  const updateValue = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (value: T) => T)(current) : next;
        writeJson(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, updateValue];
}
