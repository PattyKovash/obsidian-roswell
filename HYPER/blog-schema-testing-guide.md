# How to Test the Blog Schema

---

## Testing the live site

### Step 1 — Deploy the code
Make sure the code changes have been pushed to the live theme in Shopify before testing.

### Step 2 — Open Google's Rich Results Test
1. Go to **search.google.com/test/rich-results**
2. You don't need to log in

### Step 3 — Enter the blog URL
1. Click the **URL** tab
2. Paste: `https://hyperlitemountaingear.com/blogs/the-trailhead`
3. Click **Test URL**
4. Wait ~10 seconds for results to load

### Step 4 — Read the results
See [Reading the Results](#reading-the-results) below.

---

## Testing a preview (non-live) theme

The Rich Results Test URL tab always fetches the live theme — pasting a preview URL won't test your unpublished changes. Use the Code tab instead.

### Step 1 — Open the preview page
Open the preview page in your browser using the preview link from the Shopify theme editor.

### Step 2 — Copy the page source
1. Right-click anywhere on the page and select **View Page Source** (or press `Command + Option + U` on Mac)
2. A new tab opens showing the full page HTML — click anywhere inside it
3. Select all: `Command + A` (Mac) or `Ctrl + A` (Windows)
4. Copy: `Command + C` (Mac) or `Ctrl + C` (Windows)

### Step 3 — Paste into the Rich Results Test
1. Go to **search.google.com/test/rich-results**
2. Click the **Code** tab near the top (not the URL tab)
3. Click inside the text area, select all, then paste
4. Click **Test Code**

### Step 4 — Read the results
See [Reading the Results](#reading-the-results) below.

---

## Reading the Results

You'll see a list of detected schema types on the left. A green checkmark means it's valid.

| Status | Meaning |
|---|---|
| Green / no errors | Schema is valid and Google can read it |
| Warning (orange) | Missing recommended field — not breaking |
| Error (red) | Something is wrong — needs fixing |

**Note: Blog will not appear in the results — this is expected.** Google's Rich Results Test only surfaces schema types that are eligible to generate visual rich results in search. `Blog` is not one of them, so the tool won't list it even though the markup is valid and being read by Google.

If you see **Article** in the results when testing the blog listing page, the schema is working. Articles are embedded inside the Blog schema, so their presence confirms the Blog markup is being picked up correctly.

---

## Cross-check with Schema Markup Validator (optional)
For a more detailed view:
1. Go to **validator.schema.org**
2. Paste the same URL: `https://hyperlitemountaingear.com/blogs/the-trailhead`
3. Click **Run Test**
4. Look for the **Blog** section — it will show every field that was detected and highlight any issues

---

## Spot check the raw data (optional)
1. Go to the blog page in Chrome: `https://hyperlitemountaingear.com/blogs/the-trailhead`
2. Right-click anywhere → **View Page Source**
3. Press `Command + F` and search for `"@type": "Blog"`
4. You should see the full JSON-LD block with all the fields populated
