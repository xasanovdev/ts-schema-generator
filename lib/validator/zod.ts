type Rule = {
    check: (value: string) => boolean;
    message: string;
};

class StringSchema {
    private rules: Rule[] = [];
    private isOptional: boolean = false;

    optional() {
        this.isOptional = true;

        return this;
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

    parse(value: unknown): string | undefined {
        if (value === undefined) {
            if (this.isOptional) return undefined;

            throw new Error('Value is required.');
        }

        if (typeof value !== "string") {
            throw new Error("Type of value should be a string.");
        }

        for (let item of this.rules) {
            if (!item.check(value)) {
                throw new Error(item.message);
            }
        }

        return value;
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
