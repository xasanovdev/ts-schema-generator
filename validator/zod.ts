interface Rule<T> {
    check: (value: T) => boolean;
    message: string;
}

type ParseResult<T> =
    | {
          success: false;
          errors: string[];
          data: unknown;
      }
    | {
          success: true;
          errors: [];
          data: T;
      };

type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";

class BaseSchema<T> {
    protected rules: Rule<T>[] = [];
    protected isOptional: boolean = false;

    protected typeName: TypeofResult;

    constructor(typeName: TypeofResult) {
        this.typeName = typeName;
    }

    optional() {
        this.isOptional = true;

        return this;
    }

    protected checkOptional(value: unknown): boolean {
        if (value === undefined) {
            if (this.isOptional) return true;
        }

        return false;
    }

    protected checkTypeOfValue(value: unknown, currentType: TypeofResult) {
        return typeof value !== currentType;
    }

    protected execute(value: unknown) {
        let errors = [];
        for (let item of this.rules) {
            if (!item.check(value as T)) {
                errors.push(item.message);
            }
        }

        return errors;
    }

    parse(value: unknown): ParseResult<T> {
        if (this.checkOptional(value)) {
            return {
                success: true,
                errors: [],
                data: value as T,
            };
        }

        if (this.checkTypeOfValue(value, this.typeName)) {
            return {
                success: false,
                data: value,
                errors: [`Type of value should be ${this.typeName}.`],
            };
        }

        const errors = this.execute(value);

        if (errors.length > 0) {
            return {
                success: false,
                data: value,
                errors,
            };
        }

        return {
            success: true,
            data: value as T,
            errors: [],
        };
    }
}

class StringSchema extends BaseSchema<string> {
    constructor() {
        super("string");
    }

    min(length: number) {
        this.rules.push({
            check: (value: string) => value.length >= length,
            message: `Must be at least ${length} characters.`,
        });

        return this;
    }

    max(length: number) {
        this.rules.push({
            check: (value: string) => value.length <= length,
            message: `Must be maximum ${length} characters.`,
        });

        return this;
    }
}

class NumberSchema extends BaseSchema<number> {
    constructor() {
        super("number");
    }

    min(minValue: number) {
        this.rules.push({
            check: (value: number) => value >= minValue,
            message: `Value should be at least ${minValue}`,
        });

        return this;
    }

    max(maxValue: number) {
        this.rules.push({
            check: (value: number) => value <= maxValue,
            message: `Value should be less than ${maxValue}.`,
        });

        return this;
    }
}

class BooleanSchema extends BaseSchema<boolean> {
    constructor() {
        super("boolean");
    }
}

type Shape = Record<string, BaseSchema<any>>;

type InferShape<S extends Shape> = {
    [K in keyof S]: S[K] extends BaseSchema<infer T> ? T : never;
};

class ObjectSchema<S extends Shape> extends BaseSchema<InferShape<S>> {
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

export type infer<S> = S extends BaseSchema<infer T> ? T : never;

export const string = () => new StringSchema();
export const number = () => new NumberSchema();
export const boolean = () => new BooleanSchema();
export const object = <S extends Shape>(shape: S) => new ObjectSchema(shape);
