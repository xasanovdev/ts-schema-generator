type Rule<T> = {
    check: (value: T) => boolean;
    message: string;
};

type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";

class BaseSchema<T> {
    protected rules: Rule<T>[] = [];
    protected isOptional: boolean = false;

    optional() {
        this.isOptional = true;

        return this;
    }

    protected checkOptional(value: unknown): boolean {
        if (value === undefined) {
            if (this.isOptional) return true;

            throw new Error("Value is required.");
        }

        return false;
    }

    protected checkTypeOfValue(value: unknown, currentType: TypeofResult) {
        if (typeof value !== currentType) {
            throw new Error(`Type of value should be a ${currentType}.`);
        }
    }

    protected execute(value: unknown) {
        for (let item of this.rules) {
            if (!item.check(value as T)) {
                throw new Error(item.message);
            }
        }
    }
}

class StringSchema extends BaseSchema<string> {
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

    parse(value: unknown): string | undefined {
        if (this.checkOptional(value)) return undefined;

        this.checkTypeOfValue(value, "string");

        this.execute(value);

        return value as string;
    }
}

class NumberSchema extends BaseSchema<number> {
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

    parse(value: unknown): number | undefined {
        if (this.checkOptional(value)) return undefined;

        this.checkTypeOfValue(value, "number");
        this.execute(value);

        return value as number;
    }
}

const zod = {
    string: () => new StringSchema(),
    number: () => new NumberSchema(),
};

function testZod() {
    const stringForm = zod.string().max(100).min(20);
    console.log(stringForm.parse("Hello world hello world")); // ✅

    const numberForm = zod.number().min(18).max(100);
    console.log(numberForm.parse(25)); // ✅
    console.log(numberForm.parse(200)); // ❌ should throw
}

testZod();
