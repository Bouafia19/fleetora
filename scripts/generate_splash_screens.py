#!/usr/bin/env python3
import glob
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRAND_DIR = os.path.join(ROOT, "brand-assets")
FOREGROUND_ICON = os.path.join(BRAND_DIR, "fleetora-icon-foreground.png")
NAVY_BG = (0, 54, 111, 255) # #00366F

def generate_splash_for_file(filepath, fg_img):
    with Image.open(filepath) as orig:
        width, height = orig.size
    
    # Create solid #00366F canvas
    splash = Image.new("RGBA", (width, height), NAVY_BG)
    
    # Scale emblem to ~30% of smaller dimension, with minimum 64px
    min_dim = min(width, height)
    logo_size = max(64, int(min_dim * 0.35))
    scaled_logo = fg_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Center emblem
    x = (width - logo_size) // 2
    y = (height - logo_size) // 2
    splash.paste(scaled_logo, (x, y), scaled_logo)
    
    splash.save(filepath, "PNG")
    print(f"Updated splash: {filepath} ({width}x{height})")

def main():
    fg = Image.open(FOREGROUND_ICON).convert("RGBA")
    patterns = [
        "frontend/fleetora_vue3_capacitor6_client/android/app/src/main/res/drawable*/splash.png",
        "frontend/fleetora_vue3_capacitor6_partner/android/app/src/main/res/drawable*/splash.png"
    ]
    
    for pattern in patterns:
        full_pattern = os.path.join(ROOT, pattern)
        for filepath in sorted(glob.glob(full_pattern)):
            generate_splash_for_file(filepath, fg)

if __name__ == "__main__":
    main()
