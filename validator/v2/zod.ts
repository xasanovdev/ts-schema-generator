import { BaseSchema } from "./base-schema";
import { BooleanSchema } from "./schema-types/boolean-schema";
import { NumberSchema } from "./schema-types/number-schema";
import { ObjectSchema, Shape } from "./schema-types/object-schema";
import { StringSchema } from "./schema-types/string-schema";

export type infer<S> = S extends BaseSchema<infer T> ? T : never;

export const string = () => new StringSchema();
export const number = () => new NumberSchema();
export const boolean = () => new BooleanSchema();
export const object = <S extends Shape>(shape: S) => new ObjectSchema(shape);
