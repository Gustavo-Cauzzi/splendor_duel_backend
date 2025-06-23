// To be used in array manipulations
type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T;
export const isTruthy = <T>(value: T): value is Truthy<T> => !!value;
