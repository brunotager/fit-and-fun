"""
Remove black backgrounds from Coach Gabi jersey images.
Converts JPEG (black bg) → PNG (transparent bg).
"""
import os
from PIL import Image
import numpy as np

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "public")

# All jersey images to process
IMAGES = [
    "coach-gabi-celebrate-arsenal-jersey",
    "coach-gabi-celebrate-bulls-jersey",
    "coach-gabi-celebrate-mancity-jersey",
    "coach-gabi-celebrate-psg-jersey",
    "coach-gabi-celebrate-warriors-jersey",
    "coach-gabi-wave-right-arsenal-jersey",
    "coach-gabi-wave-right-bulls-jersey",
    "coach-gabi-wave-right-mancity-jersey",
    "coach-gabi-wave-right-psg-jersey",
    "coach-gabi-wave-right-warriors-jersey",
]

def remove_black_bg(input_path, output_path, threshold=30, feather=10):
    """Remove black background and save as PNG with transparency."""
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Extract RGB channels
    r, g, b = data[:,:,0], data[:,:,1], data[:,:,2]
    
    # Calculate brightness (max of RGB channels)
    brightness = np.maximum(np.maximum(r.astype(float), g.astype(float)), b.astype(float))
    
    # Create alpha channel: fully transparent where dark, fully opaque where bright
    # With smooth feathering in between
    alpha = np.clip((brightness - threshold) * (255.0 / feather), 0, 255).astype(np.uint8)
    
    # Apply alpha
    data[:,:,3] = alpha
    
    result = Image.fromarray(data)
    result.save(output_path, "PNG", optimize=True)
    print(f"  ✓ {os.path.basename(output_path)} ({os.path.getsize(output_path) // 1024}KB)")

def main():
    print("Removing black backgrounds from jersey images...\n")
    
    for name in IMAGES:
        jpeg_path = os.path.join(PUBLIC_DIR, f"{name}.jpeg")
        png_path = os.path.join(PUBLIC_DIR, f"{name}.png")
        
        if not os.path.exists(jpeg_path):
            print(f"  ✗ {name}.jpeg not found, skipping")
            continue
        
        remove_black_bg(jpeg_path, png_path)
    
    print(f"\nDone! {len(IMAGES)} images processed.")
    print("Original JPEGs preserved. New PNGs created with transparent backgrounds.")

if __name__ == "__main__":
    main()
