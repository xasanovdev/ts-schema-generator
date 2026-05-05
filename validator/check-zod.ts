import * as z from "./v2/zod";

const stringSchema = z.string().max(42).min(5);

let result = stringSchema.parse("12345");

type resultType = z.infer<typeof stringSchema>;

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
