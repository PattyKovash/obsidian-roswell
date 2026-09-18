# Prompt: Generate QA Test Matrix & Automated Test Fixtures for a Shopify Function Extension

Copy everything below the line and paste it into your AI agent.

---

## Context

I have a Shopify Function extension in a Shopify app. I need you to:

1. **Create a QA test matrix** as a markdown file
2. **Create automated test fixtures** for every scenario in the matrix
3. **Run the tests** and confirm they pass, including all Shopify resource limit checks

## Research First

Before writing any tests, research and confirm the correct testing approach for this project:

1. **Check the Shopify CLI version** — look at `@shopify/cli` in the root `package.json` to determine the CLI major version.
2. **Check for existing test infrastructure** — look for an existing test file in the extension's `tests/` directory. If one exists, follow its patterns exactly. Do not modify it.
3. **Check for existing fixtures** — look in `tests/fixtures/` for any existing `.json` fixture files. Read a few to understand the expected shape and structure.
4. **If no test infrastructure exists** — consult the Shopify docs for the correct testing approach for the CLI version. The test runner, fixture format, and commands may differ between CLI versions. Search for the latest Shopify Function testing documentation to confirm.
5. **Check the extension's `package.json`** (if it exists) for test-related dependencies and scripts.

The key things to confirm before proceeding:
- What test framework and helpers are used (e.g., Vitest, Jest, `@shopify/shopify-function-test-helpers`, etc.)
- The correct fixture JSON structure (field names like `input`/`output` vs `expectedOutput`, wrapper keys like `payload`, etc.)
- The correct shell command to run the tests
- Whether enum values in the output use UPPER_CASE, PascalCase, or camelCase (check the generated API types or GraphQL schema)

**Important — `runFunction` vs `execSync`:** If the project uses `@shopify/shopify-function-test-helpers`, be aware that `runFunction` tries to load `dist/index.wasm` as a binary wasm file. Shopify CLI builds produce a base64-encoded wasm artifact, which causes `runFunction` to fail with "expected `(`". The correct approach is to run the function via `execSync` with `shopify app function run --export <export_name> --json`, passing input via stdin. Check how other functions in the repo run their tests and follow that pattern.

## Instructions

### Step 1: Read the function's source files

Read these files in the extension directory:

- `shopify.extension.toml` — get the `target`, `export`, `input_query` path, and any other config
- The GraphQL input query file (referenced in the toml) — understand the full input shape and all fields the function requests
- The function source file (Rust `.rs`, or JS/TS) — understand every branch, guard clause, and return path

### Step 2: Trace every code path

Map out every conditional branch in the function. For each branch, identify:

- What input conditions trigger it
- What the function returns (operations or empty result)
- Any configurable values read from metafields or other sources

Organize paths into categories:

- **Eligibility guards** — early returns (e.g., wrong discount class, unauthenticated, missing qualifiers)
- **Core logic per configuration variant** — each combination of config values that produces different results
- **Mixed/multi-item scenarios** — carts with multiple lines or delivery groups, some qualifying and some not
- **Feature flags** — any conditional behavior based on config toggles (e.g., dev/test modes)
- **Edge cases** — empty inputs, items matching multiple conditions, boundary values

### Step 3: Create the QA test matrix

Write a markdown file at `docs/qa-test-matrix.md` with:

- A summary of the function's purpose and configuration
- Grouped tables by category (A, B, C, D, etc.) with columns:
  - `#` — scenario ID (e.g., A1, B2)
  - `Scenario` — short description
  - Relevant input columns (varies per function)
  - `Expected` — what should happen
  - `Dev` — mark ✅ for scenarios covered by passing automated fixtures; leave blank for manual-only

### Step 4: Create fixture files

For each scenario in the matrix, create a fixture file in the extension's `tests/fixtures/` directory:

- **Naming convention:** `{id}-{short-description}.json` (e.g., `a1-no-metafield.json`, `b2-code-mismatch.json`)
- Follow the exact fixture format you confirmed in the research step
- The `input` must mirror the GraphQL input query structure exactly (field names, nesting, types)
- Include `__typename` fields where the GraphQL query uses inline fragments (e.g., `... on ProductVariant`)
- Carefully trace through the function logic with each fixture's input to determine the correct expected output
- Confirm enum values match the casing used in the GraphQL schema or generated types

### Step 5: Run the tests with resource limit assertions

Run the tests using the command you confirmed in the research step. Each test must assert that the function stays within all six Shopify resource limits (1 kB = 1,000 bytes per Shopify's definition):

| Limit | Value |
|---|---|
| Instructions | 11,000,000 |
| Input size | 128,000 bytes |
| Output size | 20,000 bytes |
| Binary size | 256 kB |
| Linear memory | 10,000,000 bytes |
| Logs | 1,000 bytes |

If the test runner returns these values (e.g., `result.instructions`, `result.size`, `result.memory_usage`), add assertions for all of them — not just the output correctness check. This catches functions that are functionally correct but would be rejected at runtime.

If tests fail:

- Read the error output carefully
- Common issues: enum casing mismatch, missing `__typename`, field name typos, wrong expected output, incorrect fixture structure, base64 wasm loaded incorrectly (see `runFunction` note above)
- Fix the fixture and re-run

### Step 6: Update the matrix with test results

After all tests pass, go back to the QA test matrix markdown file and mark ✅ in the **Dev** column for every scenario that has a corresponding passing fixture. Leave blank for scenarios that require manual QA (live checkout, combination settings, native Shopify eligibility controls, etc.).

## Output

When complete, provide:
1. The path to the QA test matrix markdown file (with Dev column updated)
2. The list of all fixture files created
3. The test run results (all passing, all resource limits within bounds)
