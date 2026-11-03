# Size Guide Content Guide

How to add "How to Measure" content to a product. Paste this into the product's `accentuate.content` field via Matrixify, same as today.

**Note:** The "How to Measure" popup, on the product page and in the Quick Buy popup, previously had a bug where the calculator's code didn't run reliably. That's now fixed. The one thing to know going forward: any `<script>` tag you add must include `data-load-asset` (see #5) or it will not run.

---

## 1. Default size widget

The absolute minimum. No attributes required, this uses Junction's default sizing table, video, and images automatically.

```html
<hmg-size-widget class="hmg-sizer-std"></hmg-size-widget>
```

**Defaults used for anything left out:**
- `sizes`: Junction's 5-tier torso table (Extra Small through Tall).
- `video-url`: the general Hyperlite sizing video (`/pages/hiking-backpack-size-chart`).
- `measurement-image`: the generic torso-measurement diagram.
- `fit-images`: the generic "too small / just right / too large" fit photos.

## 2. Default widget with attribute overrides

Add attributes to override any of the defaults: your own sizes, video link, measurement diagram, or fit photos. Only include the ones you want to change, everything else still falls back to the default.

```html
<hmg-size-widget
  class="hmg-sizer-std"
  sizes='[
    {"key":"s","label":"Small","short":"S","minIn":0,"maxIn":10,"desc":"Placeholder description for the small tier."},
    {"key":"m","label":"Medium","short":"M","minIn":10,"maxIn":20,"desc":"Placeholder description for the medium tier."},
    {"key":"l","label":"Large","short":"L","minIn":20,"maxIn":99,"desc":"Placeholder description for the large tier."}
  ]'
  video-url="https://hyperlitemountaingear.com/pages/our-story"
  measurement-image="hhttps://cdn.shopify.com/s/files/1/3004/4846/files/23_06ea81fc-d2fe-4a96-8686-46ca18825d95.jpg?v=1786375876"
>
</hmg-size-widget>
```


## 3. Custom layout

If the default layout doesn't fit a product (for example, a different measurement type), provide your own layout inside a `<template>` tag.

```html
<hmg-size-widget class="hmg-sizer-std">
  <template>
    <h2>Find Your Size</h2>
    <input data-hmg-torso-input type="number">
    <button data-hmg-unit-in>IN</button>
    <button data-hmg-unit-cm>CM</button>
    <div data-hmg-error></div>
    <button data-hmg-cta>Find My Size</button>
    <div data-hmg-result>
      <p data-hmg-result-size></p>
      <p data-hmg-result-range></p>
      <p data-hmg-result-desc></p>
      <p data-hmg-tip></p>
    </div>
  </template>
</hmg-size-widget>
```

**All of these `data-hmg-*` attributes are required.** The calculator checks for all of them and only works if every one is present, if even one is missing, the whole thing silently does nothing (nothing shows for the shopper, but a note appears in the browser console for whoever's testing it).

| Attribute | What it is |
|---|---|
| `data-hmg-torso-input` | the measurement input field |
| `data-hmg-unit-in` / `data-hmg-unit-cm` | the inches/cm toggle buttons |
| `data-hmg-error` | shows a message if the input is invalid |
| `data-hmg-cta` | the submit button |
| `data-hmg-result` | wraps the result section |
| `data-hmg-result-size` | the matched size (e.g. "Medium") |
| `data-hmg-result-range` | the matched size's measurement range |
| `data-hmg-result-desc` | the matched size's description |
| `data-hmg-tip` | the sizing tip (e.g. "size up if in between") |

These can go on any element, in any order, nested however you like. Styling is entirely up to you, there are no required classes or layout, the attributes are the only thing that matters. If you don't want one of them visible (for example, hiding the unit toggle), it can still be included and hidden with CSS, it just needs to exist on the page.

## 4. Adding your own stylesheet

Drop in a `<link>` tag anywhere in your content. No special attribute needed, it just works.

```html
<link rel="stylesheet" href="https://your-css-file-url.css">
```

## 5. Adding your own script

Scripts need the `data-load-asset` attribute, or they will silently do nothing.

```html
<script data-load-asset>
  // your custom code
</script>
```

## 6. Fully custom content (no size widget)

You can still paste in fully custom HTML/CSS/JS, same as Junction's page today, just remember rule #5: any `<script>` tag needs `data-load-asset`.

```html
<style>
  .my-custom-guide { ... }
</style>
<div class="my-custom-guide">...</div>
<script data-load-asset>
  // your custom code
</script>
```

