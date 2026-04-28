import { BaseSchema } from "../base-schema";

export class NumberSchema extends BaseSchema<number> {
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
