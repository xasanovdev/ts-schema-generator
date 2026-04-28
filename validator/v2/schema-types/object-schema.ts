import { BaseSchema } from "../base-schema";

export type Shape = Record<string, BaseSchema<any>>;

type InferShape<S extends Shape> = {
    [K in keyof S]: S[K] extends BaseSchema<infer T> ? T : never;
};

export class ObjectSchema<S extends Shape> extends BaseSchema<InferShape<S>> {
    private shape: S;

    constructor(shape: S) {
        super("object");
        this.shape = shape;
    }

    protected override execute(value: unknown): string[] {
        const errors: string[] = [];
        const obj = value as Record<string, unknown>;

        for (const key in this.shape) {
            const result = this.shape[key].parse(obj[key]);
            if (!result.success) {
                errors.push(...result.errors.map((e) => `${key}: ${e}`));
            }
        }

        return errors;
    }
}
