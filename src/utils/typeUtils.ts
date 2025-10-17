export type OptionalProperty<T> = {
	[P in keyof T]?: T[P];
};
export type DeepOptionalProperty<T> = {
	[P in keyof T]?: T[P] extends object ? DeepOptionalProperty<T[P]> : T[P];
};
