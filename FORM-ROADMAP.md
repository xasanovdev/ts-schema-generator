# Form Library Roadmap

Goal: build form library from scratch, paired with custom schema validator (`validator/v2`). Each phase teaches one real concept. Resist skipping — pain in early phases motivates later optimizations.

---

## Mental Model

A form library is three things glued together:

1. **State** — values, errors, touched, dirty, submitting, submitCount
2. **Subscriptions** — which component re-renders when which field changes
3. **Validation** — when to run, which fields, sync vs async, schema vs per-field

Everything else (arrays, controllers, resolvers) is built on top.

---

## Phase 1 — Naive `useState` Form

**Goal:** feel the pain. Every keystroke re-renders whole form.

- Single `useState({})` holds all values
- `handleChange(name, value)` setter
- Validate on submit only (call `schema.parse(values)`)
- Render errors below each input

**Deliverable:** working signup form (`email`, `password`, `name`). No optimization.

**Lesson:** form state is just an object. Validation is a function. No magic.

---

## Phase 2 — `useReducer` + Actions

**Goal:** predictable state transitions.

State shape:
```ts
{
  values: Record<string, unknown>,
  errors: Record<string, string | undefined>,
  touched: Record<string, boolean>,
  dirty: Record<string, boolean>,
  isSubmitting: boolean,
  submitCount: number,
}
```

Actions:
- `SET_FIELD` — update value, mark dirty
- `SET_ERROR` — single field error
- `SET_ERRORS` — bulk (from schema)
- `SET_TOUCHED` — on blur
- `RESET` — to defaults
- `SUBMIT_START` / `SUBMIT_END`

**Lesson:** every form library has this state machine somewhere.

---

## Phase 3 — `<Form>` + `<Field>` via Context

**Goal:** ergonomic API. Children read/write without prop drilling.

- `<Form schema={...} defaultValues={...} onSubmit={...}>`
- Provides context with state + dispatch
- `useField(name)` returns `{ value, onChange, onBlur, error, touched }`
- `<Field name="email">` thin wrapper around `useField`
- `register(name)` helper — returns props ready to spread on `<input>`

**Problem appears:** context value changes on every keystroke → every `useField` consumer re-renders. Type in `email`, `password` field also re-renders. Bad.

---

## Phase 4 — Kill Re-renders (the big lesson)

Two paths. Pick (a) for closer-to-real-world.

### (a) External store + `useSyncExternalStore` (react-hook-form style)

- Plain object outside React tree holds state
- `Map<fieldName, Set<listener>>` for subscriptions
- `setField(name, value)` notifies only listeners of that name
- `useField(name)` calls `useSyncExternalStore(subscribe, getSnapshot)`
- Form root component never re-renders on keystroke

### (b) Selector context (zustand style)

- `useFormSelector(s => s.values.email)`
- Bail out with `Object.is` when slice unchanged
- Easier to write, slightly less granular

**Lesson:** React context is broadcast, not pub/sub. Real perf needs external state + targeted subscriptions.

---

## Phase 5 — Wire Validator

Connect `validator/v2` schemas to form.

- `<Form schema={userSchema}>` runs `schema.parse(values)` on submit
- Map flat errors `{ "email": "...", "address.city": "..." }` to fields
- Per-field validation modes: `onBlur`, `onChange` (debounced), `onSubmit`
- Resolver pattern: thin adapter `myResolver(schema)` → returns function `(values) => errors`. Lets users plug in zod / yup / your validator interchangeably

### Validator extensions needed

- `array(schema)` — validate lists
- `nullable()` — alongside `optional()`
- `refine(fn, message)` — custom predicate
- Async rules — `Rule<T>.check` returns `boolean | Promise<boolean>`. `parse()` becomes async-capable
- Nested error paths — currently flat `key: msg`. Need dotted path `user.address.city` so form can map deep
- `safeParse()` separate from `parse()` — match real zod surface

---

## Phase 6 — `Controller` for Non-native Inputs

Native `<input>` works with `register()` (DOM event). Custom UI (date picker, select, rich text) does not.

- `<Controller name="dob" render={({ field }) => <MyDatePicker {...field} />} />`
- `field` = `{ value, onChange, onBlur, name, ref }`
- Lib stays headless. UI library agnostic.

**Lesson:** separation of state management from rendering. Same store, different render layers.

---

## Phase 7 — Array Fields

- `useFieldArray('items')` returns `{ fields, append, prepend, remove, swap, move, insert }`
- `fields` is array of `{ id: string, ...values }` — stable ID for `key` prop, never use index
- Validator must support `array(itemSchema)` with per-index error paths: `items.0.name: "..."`
- Append/remove must update errors and dirty maps too, not just values

---

## Phase 8 — Submit Lifecycle

- `handleSubmit(onValid, onInvalid?)`
- Sequence: set `isSubmitting` → run full validation → branch → unset `isSubmitting` → bump `submitCount`
- Async submit support: `onValid` can return `Promise`
- `setError(name, message)` — server-side errors set after submit (e.g. "email already taken")
- `reset(values?)` — restore defaults or new values, clear errors/touched/dirty

---

## Phase 9 — Polish (optional)

- `watch(name)` — subscribe outside `<Field>` (e.g. show conditional UI)
- `getValues()` — imperative read, no subscription
- `trigger(name?)` — imperative validate
- DevTools — log state transitions
- Tests — RTL with form interactions

---

## File Layout

```
form/
  store.ts             # external store, subscriptions, snapshot
  context.ts           # FormContext (just exposes store)
  types.ts             # FormState, FieldState, FormConfig
  hooks/
    use-form.ts        # main hook, returns helpers
    use-field.ts       # single field subscription
    use-field-array.ts
    use-watch.ts
  components/
    form.tsx
    field.tsx
    controller.tsx
  resolvers/
    custom.ts          # adapter for validator/v2
  index.ts
```

---

## Suggested Cadence

- Phases 1–2: one sitting each. Foundations.
- Phase 3: one sitting. API shape.
- Phase 4: longest. Two sittings minimum. Read `useSyncExternalStore` docs.
- Phase 5: half sitting per validator extension.
- Phases 6–8: one sitting each.

Build tiny demo app alongside. Real form (signup, profile edit) drives every API decision.

---

## Reference Reading (when stuck)

- `react-hook-form` source — `packages/react-hook-form/src/logic/createFormControl.ts`
- `zustand` source — store + selector pattern
- `@tanstack/react-form` — different take, uses signals/atoms
- `formik` — older context-based approach (what we avoid in Phase 4)

Read source after writing your own version. Comparing your API to theirs teaches more than reading first.
