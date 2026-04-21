interface Rule<T> {
    check: (value: T) => boolean;
    message: string;
}

interface ReturnObject {
    success: boolean;
    errors: string[];
    data: unknown;
}

type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";

class BaseSchema<T> {
    protected typeName!: TypeofResult;
    protected rules: Rule<T>[] = [];
    protected isOptional: boolean = false;

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

    parse(value: unknown): ReturnObject {
        if (this.checkOptional(value)) {
            return {
                success: true,
                errors: [],
                data: value,
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
            data: value,
            errors: [],
        };
    }
}

class StringSchema extends BaseSchema<string> {
    protected typeName: TypeofResult = "string";

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
    protected typeName: TypeofResult = "number";

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
    protected typeName: TypeofResult = "boolean";
}

const zod = {
    string: () => new StringSchema(),
    number: () => new NumberSchema(),
    boolean: () => new BooleanSchema(),
};

function testZod() {
    const stringForm = zod.string().min(20);

    console.log(stringForm.parse("heelll"));
}

testZod();
