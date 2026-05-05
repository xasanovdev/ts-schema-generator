import { BaseSchema } from "./base-schema";

export class BooleanSchema extends BaseSchema<boolean> {
    constructor() {
        super("boolean");
    }
}
