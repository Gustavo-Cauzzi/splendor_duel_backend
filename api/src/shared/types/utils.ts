// Syntactic sugar
export type UUID = string;

export type TypedOmit<T, K extends keyof T> = Omit<T, K>;
