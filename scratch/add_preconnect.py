for path in ['shopify-theme/layout/theme.liquid', 'layout/theme.liquid']:
    with open(path, 'r') as f:
        content = f.read()
    
    target = '<!-- Tipografías Oficiales World TV'
    replacement = '<!-- DNS Prefetch y Preconnect para máxima velocidad -->\n  <link rel="dns-prefetch" href="https://cdn.shopify.com">\n  <link rel="preconnect" href="https://cdn.shopify.com" crossorigin>\n  ' + target
    
    if target in content and 'dns-prefetch" href="https://cdn.shopify.com' not in content:
        content = content.replace(target, replacement, 1)
        with open(path, 'w') as f:
            f.write(content)
        print(f"Updated {path}")

print("Preconnect updated!")
