import { BaseSchema } from "../base-schema";

export class StringSchema extends BaseSchema<string> {
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
