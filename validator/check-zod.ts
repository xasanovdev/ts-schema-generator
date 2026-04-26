import * as z from "./zod.ts";

const stringSchema = z.string().max(42).min(5);

let result = stringSchema.parse("12345");

type resultType = z.infer<typeof stringSchema>; // got 'string' type here

console.log(result);
