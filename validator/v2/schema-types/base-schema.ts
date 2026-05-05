import { ParseResult, Rule, TypeofResult } from "../types";

export class BaseSchema<T> {
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
