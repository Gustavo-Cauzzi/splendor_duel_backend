export const groupBy = <TKey extends PropertyKey, TValue>(
  array: TValue[],
  keyGetter: (item: TValue) => TKey,
): Record<TKey, TValue[]> => {
  return array.reduce((store, item) => {
    const key = keyGetter(item);
    if (!store[key]) {
      store[key] = [item];
    } else {
      store[key].push(item);
    }
    return store;
  }, {} as Record<TKey, TValue[]>);
};

export const toMap = <
  TKey extends PropertyKey,
  TRealValue,
  TValue = TRealValue,
>(
  array: TRealValue[],
  keyGetter: (item: TRealValue) => TKey,
  valueGetter?: (item: TRealValue) => TValue,
): Record<TKey, TValue> => {
  return array.reduce((store, item) => {
    const key = keyGetter(item);
    const value = valueGetter ? valueGetter(item) : item;
    store[key] = value as TValue;
    return store;
  }, {} as Record<TKey, TValue>);
};
