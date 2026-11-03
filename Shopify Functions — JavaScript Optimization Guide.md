
# Shopify Functions — JavaScript Optimization Guide

  

A reference for writing instruction-efficient JavaScript Shopify Functions. Applicable to any function using the `@shopify/shopify_function` package compiled via Javy.

  

---

  

## Agent Session Protocol

  

When this document is first loaded in a session, verify the following claims before using it to advise on any implementation. Shopify updates resource limits and toolchain specs without notice — stale figures here are worse than no figures.

  

**Claims to verify and where to check:**

  

| Claim | Source to check |
|---|---|
| Instruction limit: 11 million for ≤200 line items | https://shopify.dev/docs/api/functions/latest — "Dynamic limits" table |
| Input size limit: 128 kB | Same page — "Dynamic limits" table |
| JS overhead vs Rust: ~3× | https://shopify.engineering/javascript-in-webassembly-for-shopify-functions |
| JS engine is still Javy/QuickJS (not SpiderMonkey) | https://shopify.dev/docs/apps/build/functions/programming-languages/javascript-for-functions |
| ~40% improvement tied to CLI 3.67 + Javy 3.1 + `@shopify/shopify_function` v1.0 | https://shopify.dev/changelog/javascript-shopify-functions-are-now-40-faster |
| Input query max size: 3,000 bytes; metafield value cap: 10,000 bytes; max query cost: 30 | https://shopify.dev/docs/api/functions/latest — "Input query limits" table |

  

If any figure has changed, update this document before proceeding and note what changed and when.

  

---

  

## The Constraint

  

Functions have a hard limit of **11 million instructions** for carts up to 200 line items. Above 200 items the limit scales proportionally. JavaScript (via Javy/QuickJS) uses roughly **~3× more instructions** than equivalent Rust. Every optimization below is aimed at reducing QuickJS bytecode execution overhead.

  

- Limits reference: https://shopify.dev/docs/api/functions/latest

- Language considerations: https://shopify.dev/docs/apps/build/functions/programming-languages

- Resource limits deep dive: https://shopify.dev/docs/apps/build/functions/input-queries/metafields-for-input-queries

  

---

  

## Prerequisites — Use the Latest Toolchain

  

The single highest-leverage step before any code optimization. Shopify CLI 3.67 + Javy 3.1 + `@shopify/shopify_function` v1.0 delivered a ~40% instruction reduction automatically. `@shopify/shopify_function` v2.0+ adds further binary size and execution improvements on top — always use the latest.

  

```json

{

"dependencies": {

"@shopify/shopify_function": "^2.0.0"

}

}

```

  

- Changelog: https://shopify.dev/changelog/javascript-shopify-functions-are-now-40-faster

- JS for Functions guide: https://shopify.dev/docs/apps/build/functions/programming-languages/javascript-for-functions

  

---

  

## Optimization Rules

  

### 1. Early Return Aggressively

  

Exit as soon as you know no operations are needed. Most checkout requests won't match your condition — make the "do nothing" path as short as possible.

  

```js

// Good — bail out at the cheapest checks first

export function run(input) {

const config = input.someCustomization?.metafield?.jsonValue;

if (!config?.enabled) return NO_CHANGES;

  

const buyerIdentity = input.cart.buyerIdentity;

if (!buyerIdentity?.isAuthenticated) return NO_CHANGES;

  

// ... more expensive checks below

}

```

  

Order your guards from cheapest to most expensive:

1. Config/metafield flag checks (boolean)

2. Authentication checks

3. Cart line iteration

  

---

  

### 2. Use `for` Loops Instead of Higher-Order Functions

  

`forEach`, `some`, `filter`, `map`, and `reduce` each create closures. In QuickJS, closure creation and invocation add measurable overhead per call. Use imperative `for` loops with early `break`.

  

```js

// Avoid

const hasMTO = input.cart.lines.some(line => line.attribute?.value);

  

// Prefer

const lines = input.cart.lines;

let hasMTO = false;

for (let i = 0; i < lines.length; i++) {

if (lines[i].attribute?.value) {

hasMTO = true;

break; // exit as soon as found

}

}

```

  

Cache the array reference outside the loop (`const lines = input.cart.lines`) to avoid re-evaluating the property access each iteration.

  

---

  

### 3. Use `Set` for Membership Checks

  

`Array.includes()` is O(n) — it scans every element. `Set.has()` is O(1).

  

```js

// Avoid — O(n) per lookup

if (devEmails.includes(customerEmail)) { ... }

  

// Prefer — O(1) lookup

const devEmailSet = new Set(devEmails);

if (devEmailSet.has(customerEmail)) { ... }

```

  

Worth it any time you check membership more than once, or when the list may grow.

  

---

  

### 4. Avoid Regex

  

Regular expressions are expensive to compile and execute in Javy. For string matching use `includes()`, `startsWith()`, `endsWith()`, or `indexOf()` instead.

  

```js

// Avoid

if (/rush|expedited/i.test(title)) { ... }

  

// Prefer

const upper = title.toUpperCase();

if (upper.includes("RUSH") || upper.includes("EXPEDITED")) { ... }

```

  

---

  

### 5. Cache Repeated Computations Inside Loops

  

Avoid re-deriving values you already have. The most common case is string transformation (`toUpperCase`, `toLowerCase`) inside a loop.

  

```js

// Avoid — allocates a new string on every iteration

for (let j = 0; j < options.length; j++) {

if (options[j].title?.toUpperCase().includes("RUSH")) { ... }

}

  

// Prefer — compute once per iteration, reuse

for (let j = 0; j < options.length; j++) {

const title = options[j].title;

if (!title) continue;

const upper = title.toUpperCase(); // one allocation per option

if (upper.includes("RUSH") || upper.includes("EXPEDITED")) { ... }

}

```

  

---

  

### 6. Minimize JSON Parsing

  

`@shopify/shopify_function` v2+ uses the Shopify Wasm API for **lazy input loading** — fields are only accessed when your code reads them, not parsed upfront. This is the primary reason to stay on v2+.

  

Beyond that:

- Access `jsonValue` (pre-parsed object) over `value` (raw JSON string) on metafields — the platform parses it for you

- Don't re-parse data you've already destructured

- Avoid `JSON.stringify` / `JSON.parse` on intermediate values

  

```js

// Prefer jsonValue (platform-parsed)

const config = input.deliveryCustomization?.metafield?.jsonValue;

  

// Avoid value + manual parse

const config = JSON.parse(input.deliveryCustomization?.metafield?.value);

```

  

---

  

### 7. Inline Small Single-Use Functions

  

Function call overhead in QuickJS is non-trivial when the called function is a trivial one-liner called in a hot loop. Inline it.

  

```js

// Avoid — call overhead per iteration

function isRushOrExpedited(title) {

return title.includes("RUSH") || title.includes("EXPEDITED");

}

// ...

if (isRushOrExpedited(upper)) { ... }

  

// Prefer — inlined

if (upper.includes("RUSH") || upper.includes("EXPEDITED")) { ... }

```

  

---

  

### 8. Request Only Fields You Need in the Input Query

  

The input query determines how much data is deserialized and how large the function input is (128 kB max). Unused fields still consume budget. Only select what your logic actually reads.

  

```graphql

# Avoid requesting fields your function doesn't use

cart {

lines {

id # not needed if you only check attributes

quantity # not needed

attribute(key: "Made to Order") {

value # only this is needed

}

}

}

```

  

Input query limits: https://shopify.dev/docs/api/functions/latest (see "Input query limits" section)

  

---

  

### 9. Defer Expensive Input Access

  

Because v2+ uses lazy loading, accessing a field has a cost. Don't access fields you may not need.

  

```js

// Avoid — accesses buyerIdentity even when dev mode is off

const buyerIdentity = input.cart.buyerIdentity;

const config = input.deliveryCustomization?.config?.jsonValue;

if (config?.enableDevTest) {

if (!buyerIdentity?.isAuthenticated) return NO_CHANGES;

}

  

// Prefer — only access buyerIdentity if dev mode is on

const config = input.deliveryCustomization?.config?.jsonValue;

if (config?.enableDevTest) {

const buyerIdentity = input.cart.buyerIdentity; // accessed only when needed

if (!buyerIdentity?.isAuthenticated) return NO_CHANGES;

}

```

  

---

  

### 10. Remove Dead Code and Defensive Fallbacks

  

Every branch in the compiled Wasm adds overhead. Remove fallbacks for states that cannot occur (e.g., legacy field names from an old metafield schema, impossible null cases on guaranteed fields).

  

```js

// Avoid — dead fallback for a field that was never written

const devEmails = Array.isArray(config.devEmails)

? config.devEmails

: (config.devEmail ? [config.devEmail] : []); // devEmail never existed

  

// Prefer

const devEmails = config.devEmails ?? [];

```

  

---

  

## When These Optimizations Are Not Enough

  

If your function is still hitting instruction limits after the above:

  

1. **Measure first** — use `shopify app logs` or Dev Dashboard to see actual instruction counts before optimizing blindly

2. **Simplify the input query** — fewer fields = less deserialization work

3. **Consider Rust** — the same logic in Rust uses ~3× fewer instructions and compiles to a smaller binary. Shopify strongly recommends Rust for production functions on public apps or complex logic: https://shopify.dev/docs/apps/build/functions/programming-languages

  

---

  

## Quick Reference Checklist

  

- [ ] `@shopify/shopify_function` v2.0+ in `package.json`

- [ ] Latest Shopify CLI (`shopify upgrade`)

- [ ] Early returns ordered cheapest → most expensive

- [ ] `for` loops instead of `forEach` / `some` / `map`

- [ ] `Set` for repeated membership checks

- [ ] No regex — use `includes()` / `indexOf()`

- [ ] No `toUpperCase()` / `toLowerCase()` inside loop without caching

- [ ] `jsonValue` over `value` on metafields

- [ ] Input query requests only fields used by function logic

- [ ] Expensive input fields accessed lazily (inside guards)

- [ ] No dead code / unreachable fallback branches

  

---

  

## Resources

  

- [Shopify Functions resource limits](https://shopify.dev/docs/api/functions/latest)

- [JavaScript for Functions](https://shopify.dev/docs/apps/build/functions/programming-languages/javascript-for-functions)

- [Language considerations (JS vs Rust)](https://shopify.dev/docs/apps/build/functions/programming-languages)

- [WebAssembly for Functions (Wasm API / lazy loading)](https://shopify.dev/docs/apps/build/functions/programming-languages/webassembly-for-functions)

- [Monitoring and errors in production](https://shopify.dev/docs/apps/build/functions/monitoring-and-errors)

- [JS Functions 40% faster changelog](https://shopify.dev/changelog/javascript-shopify-functions-are-now-40-faster)

- [Shopify engineering: JS in Wasm](https://shopify.engineering/javascript-in-webassembly-for-shopify-functions)