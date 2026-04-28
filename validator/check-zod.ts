import * as z from "./zod.ts";

const stringSchema = z.string().max(42).min(5);

let result = stringSchema.parse("12345");

type resultType = z.infer<typeof stringSchema>; // got 'string' type here

const objSchema = z.object({
    name: z.string(),
    age: z.number(),
});

console.log(
    objSchema.parse({
        name: "sss",
        age: "ss",
    }),
);
