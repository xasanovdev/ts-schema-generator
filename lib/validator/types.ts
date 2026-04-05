// ============================================================
// LESSON 1: TypeScript Types & Interfaces
// ============================================================

// --- CONCEPT: interface ---
// An interface describes the SHAPE of an object.
// Think of it as a contract: "any object of this type MUST have these fields"

// This describes a single validation rule for ONE field.
// Every property is optional (?) because not every field needs every rule.
export interface ValidationRule {
    required?: boolean; // is the field mandatory?
    minLength?: number; // minimum string length
    maxLength?: number; // maximum string length
    min?: number; // minimum number value
    max?: number; // maximum number value
    pattern?: RegExp; // regex pattern to match against
    message?: string; // custom error message
}

// --- CONCEPT: Record<K, V> ---
// Record is a built-in TypeScript UTILITY TYPE.
// Record<string, ValidationRule> means:
//   "an object where keys are strings and values are ValidationRule"
//
// Example:
//   { name: { required: true }, email: { pattern: /.../ } }
//
// This is equivalent to writing: { [key: string]: ValidationRule }
export type ValidationRules = Record<string, ValidationRule>;

// --- CONCEPT: Mapping types with Record ---
// Here we say: "for the SAME keys as the rules, store an error string (or undefined)"
//
// If your rules have keys "name" and "email",
// then errors will also have keys "name" and "email".
//
// The `| undefined` means a field might have no error.
export type ValidationErrors<T extends ValidationRules> = Record<
    keyof T,
    string | undefined
>;

// --- CONCEPT: Generic type parameter <T> ---
// The <T extends ValidationRules> above is a GENERIC.
// It's like a variable, but for TYPES instead of values.
//
// When you call validate(data, rules), TypeScript will figure out
// what T is based on the rules you pass, and make sure the errors
// object has the exact same keys.
