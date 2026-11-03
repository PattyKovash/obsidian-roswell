# PDP zoom dead after color swap

**Repo:** `the-sak-vite` · Liquid only, no JS changes.

## Cause

`Shopify/snippets/media.liquid:70` gates the zoom hooks on `section.settings.enable_zoom`. The color swap re-renders the gallery via `Shopify/sections/api-product-color-swap.liquid`, which has no `{% schema %}` (pure Section Rendering API endpoint), so `section.settings` is nil and `data-zoom-image` is dropped. `zoom.js` binds listeners to `[data-zoom-image]` — zero matches, zero listeners.

Fix: thread `enable_zoom` down as a render param, same as `enable_video_looping` / `image_width` already are.

## Edits

**1. `Shopify/snippets/media.liquid`** — append to the opening `{%- liquid -%}` block (~line 21):

```liquid
  assign enable_zoom = enable_zoom | default: section.settings.enable_zoom, allow_false: true
```

`allow_false: true` is required. Without it the filter falls back whenever the input is falsy, so an explicit `enable_zoom: false` would be overridden. Don't use `== blank` either — Liquid's `blank` matches `false` as well as `nil`.

Then, ~line 70:

```diff
-      {% if section.settings.enable_zoom %}
+      {% if enable_zoom %}
```

**2. `Shopify/snippets/product-gallery-slides.liquid`** — in the `render 'media'` call (~line 67):

```diff
         image_width: image_width,
+        enable_zoom: enable_zoom,
         cover: true
```

**3. `Shopify/sections/product.liquid`** — in the `render 'product-gallery-slides'` call (~line 186):

```diff
               image_width: image_width,
+              enable_zoom: section.settings.enable_zoom,
               frame_aspect_ratio: featured_media_aspect_ratio
```

**4. `Shopify/sections/api-product-color-swap.liquid`** — in the `render 'product-gallery-slides'` call (~line 64):

```diff
         image_width: image_width,
+        enable_zoom: true,
         frame_aspect_ratio: featured_media_aspect_ratio
```

Update the `Accepts:` header comments in both snippets.

## Verify

On a PDP with color siblings, click a swatch, then in console:

```js
const z = document.querySelector('zoom-images');
[z.querySelectorAll('[data-zoom-image]').length, z.querySelectorAll('.product__photo').length];
```

Both numbers equal and non-zero. Then click an image — Photoswipe should open.

Regression check: zoom on initial PDP load, and the upsell gallery (`api-product-upsell.liquid` also renders `media.liquid`).
