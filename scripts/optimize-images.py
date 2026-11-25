"""Rebuild the WebP portfolio assets with Pillow (development tool only)."""
from pathlib import Path
from PIL import Image

images = Path(__file__).resolve().parent.parent / "client" / "public" / "images"
for source in sorted(images.glob("*.jpg")):
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((800, 800))
        destination = source.with_suffix(".webp")
        image.save(destination, "WEBP", quality=82, method=6)
        print(f"{source.name}: {source.stat().st_size} -> {destination.stat().st_size} bytes")
