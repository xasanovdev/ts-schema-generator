import { ValidationErrors, ValidationRules } from "./types";

const data = {
    name: "",
    email: "ali@gmal",
    age: 200,
    bio: "asfdgfadvfsadvfdsvfdsvfsdvfsdvddfvfdv",
};

const rules = {
    name: { required: true, minLength: 3, maxLength: 50 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    age: { required: true, min: 18, max: 100 },
    bio: { maxLength: 20 },
};

export function validate(
    data: Record<string, unknown>,
    rules: ValidationRules,
) {
    const errors: ValidationErrors<typeof rules> = {};

    for (const key in rules) {
        const rule = rules[key];
        const value = data[key];

        if (
            rule.required &&
            (value === undefined || value === null || value === "")
        ) {
            errors[key] =
                rule.message || `${key.toUpperCase()} field is required.`;
            continue;
        }

        // for string values
        if (typeof value === "string") {
            if (rule.minLength && value.length < rule.minLength) {
                errors[key] =
                    rule.message ||
                    `${key.toUpperCase()} field is should be greater than ${rule.minLength}.`;
                continue;
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors[key] =
                    rule.message ||
                    `${key.toUpperCase()} field is should be lower than ${rule.maxLength}`;
                continue;
            }

            // for regex things
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[key] =
                    rule.message ||
                    `${key.toUpperCase()} field has invalid format.`;
                continue;
            }
        }

        // for number values
        if (typeof value === "number") {
            if (rule.max && value > rule.max) {
                errors[key] =
                    rule.message ||
                    `${key.toUpperCase()} field should be lower than ${rule.max}.`;
                continue;
            }

            if (rule.min && value < rule.min) {
                errors[key] =
                    rule.message ||
                    `${key.toUpperCase()} field should be greater than ${rule.min}.`;
                continue;
            }
        }
    }

    return errors;
}

console.log(validate(data, rules));
