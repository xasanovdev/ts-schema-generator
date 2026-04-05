type Rule = {
    check: (value: string) => boolean;
    message: string;
};

type TypeofResult = "string" | "number" | "boolean" | "object" | "undefined";

class BaseSchema {
    protected rules: Rule[] = [];
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
}

class StringSchema extends BaseSchema {
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

        for (let item of this.rules) {
            if (!item.check(value as string)) {
                throw new Error(item.message);
            }
        }

        return value as string;
    }
}

const zod = {
    string: () => new StringSchema(),
};

function testZod() {
    const form = zod.string().max(100).min(20);

    console.log(form.parse("Hello world hello world"));
}

testZod();
