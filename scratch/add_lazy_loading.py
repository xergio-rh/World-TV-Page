import re
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    orig_content = content

    def replace_img(match):
        tag = match.group(0)
        
        # Check if already has loading
        has_loading = 'loading=' in tag
        has_decoding = 'decoding=' in tag
        
        # Is it hero banner 1 or logo?
        is_above_fold = any(term in tag.lower() for term in [
            'worldtv_logo', 'hero-slide-1', 'slide1', 'main-logo', 'site-logo'
        ])
        
        new_tag = tag[:-1].strip() # strip trailing '>'
        
        if not has_loading:
            if is_above_fold:
                new_tag += ' loading="eager" fetchpriority="high"'
            else:
                new_tag += ' loading="lazy"'
                
        if not has_decoding:
            new_tag += ' decoding="async"'
            
        new_tag += '>'
        return new_tag

    # Match all <img ...>
    updated = re.sub(r'<img\s+[^>]*>', replace_img, content)

    if updated != orig_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated)
        print(f"Updated {filepath}")

# Process liquid templates and snippets
for pattern in [
    'shopify-theme/sections/*.liquid',
    'shopify-theme/snippets/*.liquid',
    'shopify-theme/layout/*.liquid',
    'snippets/*.liquid',
    'sections/*.liquid',
    '*.html'
]:
    for f in glob.glob(pattern):
        process_file(f)

print("Finished adding lazy loading and decoding attributes!")
