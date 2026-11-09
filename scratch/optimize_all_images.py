import os
import glob
from PIL import Image

def optimize_image(filepath):
    orig_size = os.path.getsize(filepath)
    ext = os.path.splitext(filepath)[1].lower()
    
    if ext not in ('.jpg', '.jpeg', '.png', '.webp'):
        return 0, 0
    
    # Don't touch files under 80KB unless easy
    if orig_size < 80 * 1024:
        return orig_size, orig_size

    try:
        with Image.open(filepath) as im:
            w, h = im.size
            format_name = im.format
            mode = im.mode
            
            # 1. Handle JPEG
            if ext in ('.jpg', '.jpeg'):
                # Resize if excessively large (e.g. > 1920px wide or high)
                resized = False
                max_dim = 1920
                if w > max_dim or h > max_dim:
                    if w >= h:
                        new_w = max_dim
                        new_h = int(h * (max_dim / w))
                    else:
                        new_h = max_dim
                        new_w = int(w * (max_dim / h))
                    im = im.resize((new_w, new_h), Image.LANCZOS)
                    resized = True

                # Convert mode to RGB if CMYK or other
                if mode != 'RGB':
                    im = im.convert('RGB')
                
                temp_path = filepath + '.tmp'
                im.save(temp_path, 'JPEG', quality=83, optimize=True, progressive=True)
                new_size = os.path.getsize(temp_path)
                
                if new_size < orig_size:
                    os.replace(temp_path, filepath)
                    return orig_size, new_size
                else:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    return orig_size, orig_size

            # 2. Handle PNG
            elif ext == '.png':
                has_alpha = mode in ('RGBA', 'LA') or (mode == 'P' and 'transparency' in im.info)
                if has_alpha:
                    alpha = im.split()[-1]
                    extrema = alpha.getextrema()
                    # If alpha is completely 255 everywhere, it doesn't actually need alpha
                    if extrema == (255, 255):
                        has_alpha = False
                
                # If PNG has NO alpha and is huge (e.g. banner_belleza_mobile.png is 2.2MB RGB),
                # we can either optimize PNG heavily or keep PNG with adaptive colors
                temp_path = filepath + '.tmp'
                
                # Resize if excessively large > 1920
                if w > 1920 or h > 1920:
                    if w >= h:
                        new_w = 1920
                        new_h = int(h * (1920 / w))
                    else:
                        new_h = 1920
                        new_w = int(w * (1920 / h))
                    im = im.resize((new_w, new_h), Image.LANCZOS)
                
                if not has_alpha and orig_size > 500 * 1024:
                    # High quality 256 adaptive palette PNG with dithering
                    im_opt = im.convert('P', palette=Image.ADAPTIVE, colors=256)
                    im_opt.save(temp_path, 'PNG', optimize=True)
                else:
                    im.save(temp_path, 'PNG', optimize=True)
                
                new_size = os.path.getsize(temp_path)
                if new_size < orig_size:
                    os.replace(temp_path, filepath)
                    return orig_size, new_size
                else:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                    return orig_size, orig_size

    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")
        return orig_size, orig_size

    return orig_size, orig_size

def run_dir(dir_path):
    print(f"\n--- Optimizing directory: {dir_path} ---")
    files = glob.glob(os.path.join(dir_path, '*.*'))
    total_orig = 0
    total_new = 0
    count = 0
    
    for f in sorted(files):
        orig, new = optimize_image(f)
        if orig > 0:
            total_orig += orig
            total_new += new
            count += 1
            if orig > new and (orig - new) > 50 * 1024:
                diff_mb = (orig - new) / (1024 * 1024)
                saved_pct = (1 - new / orig) * 100
                print(f"  {os.path.basename(f)}: {orig/(1024*1024):.2f}MB -> {new/(1024*1024):.2f}MB (-{diff_mb:.2f}MB, {saved_pct:.1f}% off)")
                
    saved_mb = (total_orig - total_new) / (1024 * 1024)
    print(f"\nSummary for {dir_path}:")
    print(f"  Processed {count} images.")
    print(f"  Original size: {total_orig / (1024*1024):.2f} MB")
    print(f"  Optimized size: {total_new / (1024*1024):.2f} MB")
    print(f"  Total Saved: {saved_mb:.2f} MB ({(1 - total_new/total_orig)*100:.1f}% reduction!)")

if __name__ == '__main__':
    run_dir('shopify-theme/assets')
    run_dir('assets')
