# Shopify CLI Silent Failure Audit

The Shopify CLI (`shopify theme push`, `shopify theme deploy`, `shopify app deploy`) exits 0 even when files fail to upload. It prints "pushed with errors" as a warning but CI reports success. Audit all workflow files for bare Shopify CLI deploy commands and wrap them to fail on error output.

## Example fix

Before:
```yaml
- name: Deploy theme
  run: shopify theme push -t "${{ secrets.THEME_ID }}" --path "${{ secrets.THEME_PATH }}"
```

After:
```yaml
- name: Deploy theme
  run: |
    output=$(shopify theme push -t "${{ secrets.THEME_ID }}" --path "${{ secrets.THEME_PATH }}" 2>&1)
    echo "$output"
    if echo "$output" | grep -qi "pushed with errors"; then
      echo "::error::Shopify theme push completed with errors — see output above"
      exit 1
    fi
```

Scan `.github/workflows/` for any step running a Shopify CLI deploy command (`shopify theme push`, `shopify theme deploy`, `shopify app deploy`). If the step runs the command bare without output capture, apply this pattern. Preserve existing env vars, secrets, and flags — only wrap the command and add the grep check. Skip steps that already validate output or use a different deploy mechanism.
