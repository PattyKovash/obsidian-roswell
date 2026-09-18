> Point an AI agent session at this file, working directory set to the specific extension you want covered, and have it follow the instructions below — e.g. `read shopify-function-qa-test-matrix-and-fixtures-prompt.md and generate a QA test matrix + fixtures for <extension>`. This file itself is not a protocol doc — it's a reusable prompt template for generating a QA test matrix and automated test fixtures for any Shopify Function extension. Not merchant-specific; originated from `BAUBLEBAR_CE_EXT`'s `docs/` folder, generalized for agency-wide reuse. Also mirrored to `roswell-agency/prompts/engineering/`.

---

## The Prompt

## Context

I have a Shopify Function extension in a Shopify app. I need you to:

1. **Create a QA test matrix** as a markdown file
2. **Create automated test fixtures** for every scenario in the matrix
3. **Run the tests** and confirm they pass

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

## Instructions

### Step 1: Read the function's source files

Read these files in the extension directory:

- `shopify.extension.toml` — get the `target`, `export`, `input_query` path, and any other config
- The GraphQL input query file (referenced in the toml) — understand the full input shape and all fields the function requests
- The JS/TS function file — understand every branch, guard clause, and return path

### Step 2: Trace every code path

Map out every conditional branch in the function. For each branch, identify:

- What input conditions trigger it
- What the function returns (operations or empty result)
- Any configurable values read from metafields or other sources

Organize paths into categories:

- **Eligibility guards** — early returns (e.g., wrong discount class, unauthenticated, missing qualifiers)
- **Core logic per configuration variant** — each combination of config values that produces different results
- **Mixed/multi-item scenarios** — carts with multiple lines, some qualifying and some not
- **Feature flags** — any conditional behavior based on config toggles (e.g., dev/test modes)
- **Edge cases** — empty inputs, items matching multiple conditions, boundary values

### Step 3: Create the QA test matrix

Write a markdown file at `docs/qa-test-matrix.md` with:

- A summary of the function's purpose and configuration
- Grouped tables by category (A, B, C, D, etc.) with columns:
  - `#` — scenario ID (e.g., A1, B2a)
  - `Scenario` — short description
  - Relevant input columns (varies per function)
  - `Expected Result` — what should happen
  - `Dev` — mark `X` for scenarios covered by automated fixtures
  - `QA` — leave blank for manual QA to fill in

### Step 4: Create fixture files

For each scenario in the matrix, create a fixture file in the extension's `tests/fixtures/` directory:

- **Naming convention:** `{id}-{short-description}.json` (e.g., `a1-guest.json`, `b2a-some-scenario.json`)
- Follow the exact fixture format you confirmed in the research step
- The `input` must mirror the GraphQL input query structure exactly (field names, nesting, types)
- Include `__typename` fields where the GraphQL query uses inline fragments (e.g., `... on ProductVariant`)
- Carefully trace through the function's JS/TS logic with each fixture's input to determine the correct expected output
- Confirm enum values match the casing used in the GraphQL schema or generated types
- **If a fixture's input data can't be constructed with full certainty from the code, schema, and existing fixtures alone** — e.g. the real-world shape of a field, a value combination Shopify actually sends, or an edge case the generated types don't fully capture — stop and ask the prompter for a real-world example input/output before writing that fixture. Don't guess at a plausible-looking value when the actual runtime shape is uncertain; a schema-valid fixture can still misrepresent reality.

### Step 5: Run the tests

Run the tests using the command you confirmed in the research step. If tests fail:

- Read the error output carefully
- Common issues: enum casing mismatch, missing `__typename`, field name typos, wrong expected output, incorrect fixture structure
- Fix the fixture and re-run

### Step 6: Update the matrix with test results

After all tests pass, go back to the QA test matrix markdown file and mark `X` in the **Dev** column for every scenario that has a corresponding passing fixture. Do not mark scenarios that were skipped or do not have a fixture.

## Output

When complete, provide:
1. The path to the QA test matrix markdown file (with Dev column updated)
2. The list of all fixture files created
3. The test run results (all passing)
