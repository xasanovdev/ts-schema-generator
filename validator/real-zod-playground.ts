import * as z from "zod";

const human = z.object({
    name: z.string(),
    age: z.number().min(30),
});

console.log(human.parse({
    name: 'hhhh',
    age: 22
}));
