#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND_DIR = os.path.join(ROOT, "brand-assets")
MASTER_ICON = os.path.join(BRAND_DIR, "fleetora-icon-1024.png")
FOREGROUND_ICON = os.path.join(BRAND_DIR, "fleetora-icon-foreground.png")

NAVY_COLOR = (0, 54, 111, 255) # #00366F

def create_circular_mask(size):
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size, size), fill=255)
    return mask

def make_round(img):
    size = img.size[0]
    mask = create_circular_mask(size)
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    return output

def generate_web_assets(dest_dir):
    os.makedirs(dest_dir, exist_ok=True)
    master = Image.open(MASTER_ICON).convert("RGBA")
    
    # 512 & 192
    img512 = master.resize((512, 512), Image.Resampling.LANCZOS)
    img512.save(os.path.join(dest_dir, "fleetora-icon-512.png"))
    
    img192 = master.resize((192, 192), Image.Resampling.LANCZOS)
    img192.save(os.path.join(dest_dir, "fleetora-icon-192.png"))
    
    # apple touch icon 180x180
    img180 = master.resize((180, 180), Image.Resampling.LANCZOS)
    img180.save(os.path.join(dest_dir, "apple-touch-icon.png"))
    
    # favicon.png 32x32
    img32 = master.resize((32, 32), Image.Resampling.LANCZOS)
    img32.save(os.path.join(dest_dir, "favicon.png"))
    
    # favicon.ico (multi-size: 16, 32, 48)
    img16 = master.resize((16, 16), Image.Resampling.LANCZOS)
    img48 = master.resize((48, 48), Image.Resampling.LANCZOS)
    img48.save(os.path.join(dest_dir, "favicon.ico"), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated web assets in {dest_dir}")

def generate_android_assets(res_dir):
    master = Image.open(MASTER_ICON).convert("RGBA")
    foreground = Image.open(FOREGROUND_ICON).convert("RGBA")
    
    densities = {
        "mipmap-ldpi": {"launcher": 36, "fg": 81},
        "mipmap-mdpi": {"launcher": 48, "fg": 108},
        "mipmap-hdpi": {"launcher": 72, "fg": 162},
        "mipmap-xhdpi": {"launcher": 96, "fg": 216},
        "mipmap-xxhdpi": {"launcher": 144, "fg": 324},
        "mipmap-xxxhdpi": {"launcher": 192, "fg": 432},
    }
    
    for folder, sizes in densities.items():
        folder_path = os.path.join(res_dir, folder)
        if not os.path.exists(folder_path):
            continue
            
        launcher_size = sizes["launcher"]
        fg_size = sizes["fg"]
        
        # ic_launcher.png
        launcher_img = master.resize((launcher_size, launcher_size), Image.Resampling.LANCZOS)
        launcher_img.save(os.path.join(folder_path, "ic_launcher.png"))
        
        # ic_launcher_round.png
        round_img = make_round(launcher_img)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"))
        
        # ic_launcher_foreground.png
        fg_img = foreground.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        fg_img.save(os.path.join(folder_path, "ic_launcher_foreground.png"))
        
        # ic_launcher_background.png (solid #00366F)
        bg_img = Image.new("RGBA", (fg_size, fg_size), NAVY_COLOR)
        bg_img.save(os.path.join(folder_path, "ic_launcher_background.png"))
        
    # update values/ic_launcher_background.xml
    values_xml = os.path.join(res_dir, "values", "ic_launcher_background.xml")
    if os.path.exists(values_xml):
        with open(values_xml, "w") as f:
            f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#00366F</color>
</resources>
''')
    print(f"Generated Android assets in {res_dir}")

def main():
    print("Generating Fleetora assets...")
    # Web
    generate_web_assets(os.path.join(ROOT, "frontend/fleetora_web_vue3/public"))
    # Client
    generate_web_assets(os.path.join(ROOT, "frontend/fleetora_vue3_capacitor6_client/public"))
    generate_android_assets(os.path.join(ROOT, "frontend/fleetora_vue3_capacitor6_client/android/app/src/main/res"))
    # Partner
    generate_web_assets(os.path.join(ROOT, "frontend/fleetora_vue3_capacitor6_partner/public"))
    generate_android_assets(os.path.join(ROOT, "frontend/fleetora_vue3_capacitor6_partner/android/app/src/main/res"))
    print("All assets successfully generated!")

if __name__ == "__main__":
    main()
