#!/usr/bin/env python3
"""
Genera portadas de vinilo originales (arte abstracto procedural) para el
catálogo de Surco. Cada portada es única: gradiente + formas geométricas
+ tipografía con el título del álbum y el artista. No usa ninguna imagen
ni marca de terceros: es arte generado para este proyecto.
"""
import hashlib
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "img", "covers")
os.makedirs(OUT_DIR, exist_ok=True)

SIZE = 1000

# Paletas por género (indie_rock, electronica, soul_jazz)
PALETTES = {
    "indie_rock": [
        ("#2b1b17", "#e0674b"),
        ("#1c1c2e", "#f2a65a"),
        ("#241623", "#e63946"),
        ("#151a1e", "#f4a259"),
        ("#20161d", "#ef8354"),
        ("#1b1b2f", "#f25c54"),
    ],
    "electronica": [
        ("#0d0f2b", "#4cc9f0"),
        ("#0a0e23", "#7b2ff7"),
        ("#0f1226", "#00f5d4"),
        ("#101035", "#f72585"),
        ("#0b1026", "#4361ee"),
        ("#100e2a", "#b5179e"),
    ],
    "soul_jazz": [
        ("#241a12", "#d4a24e"),
        ("#1f1710", "#c98a3f"),
        ("#221812", "#e2b23c"),
        ("#1a140f", "#b5651d"),
        ("#231b13", "#dba159"),
        ("#1c140d", "#c77b3b"),
    ],
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_gradient(size, c1, c2, angle_deg):
    base = Image.new("RGB", (size, size), c1)
    top = Image.new("RGB", (size, size), c2)
    mask = Image.new("L", (size, size))
    md = mask.load()
    angle = math.radians(angle_deg)
    dx, dy = math.cos(angle), math.sin(angle)
    for y in range(size):
        for x in range(0, size, 2):
            t = ((x * dx + y * dy) / (size * (abs(dx) + abs(dy)) + 1e-6))
            v = max(0, min(255, int(t * 255)))
            md[x, y] = v
            if x + 1 < size:
                md[x + 1, y] = v
    return Image.composite(top, base, mask)


def add_grain(img, amount=10):
    import numpy as np

    arr = np.array(img).astype("int16")
    noise = np.random.randint(-amount, amount, arr.shape, dtype="int16")
    arr = np.clip(arr + noise, 0, 255).astype("uint8")
    return Image.fromarray(arr)


def draw_shapes(draw, rng, size, accent):
    style = rng.choice(["circles", "bars", "waves", "triangle"])
    a = accent + (255,)
    if style == "circles":
        for i in range(rng.randint(3, 6)):
            r = rng.randint(int(size * 0.08), int(size * 0.42))
            cx = rng.randint(0, size)
            cy = rng.randint(0, size)
            alpha = rng.randint(40, 140)
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r],
                outline=accent + (alpha,),
                width=rng.randint(3, 10),
            )
    elif style == "bars":
        n = rng.randint(5, 10)
        w = size / n
        for i in range(n):
            h = rng.randint(int(size * 0.1), int(size * 0.6))
            x0 = i * w
            alpha = rng.randint(90, 220)
            draw.rectangle(
                [x0, size - h, x0 + w * 0.6, size],
                fill=accent + (alpha,),
            )
    elif style == "waves":
        for line in range(4):
            pts = []
            amp = rng.randint(30, 120)
            freq = rng.uniform(1.5, 4)
            phase = rng.uniform(0, 6.28)
            yoff = size * (0.25 + line * 0.18)
            for x in range(0, size + 10, 10):
                y = yoff + amp * math.sin(freq * x / size * 2 * math.pi + phase)
                pts.append((x, y))
            draw.line(pts, fill=accent + (200,), width=rng.randint(4, 9))
    else:  # triangle
        for i in range(rng.randint(2, 4)):
            cx, cy = rng.randint(0, size), rng.randint(0, size)
            r = rng.randint(int(size * 0.15), int(size * 0.45))
            rot = rng.uniform(0, 6.28)
            pts = []
            for k in range(3):
                ang = rot + k * 2.094
                pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
            alpha = rng.randint(60, 160)
            draw.polygon(pts, outline=accent + (alpha,), width=rng.randint(3, 8))


def load_font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        bbox = draw.textbbox((0, 0), trial, font=font)
        if bbox[2] - bbox[0] <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def generate_cover(slug, title, artist, genre_key, seed):
    rng = random.Random(seed)
    bg_hex, accent_hex = rng.choice(PALETTES[genre_key])
    bg = hex_to_rgb(bg_hex)
    accent = hex_to_rgb(accent_hex)
    angle = rng.choice([20, 45, 70, 110, 160, 200, 250, 300])
    img = make_gradient(SIZE, bg, lerp(bg, accent, 0.35), angle).convert("RGBA")

    overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_shapes(draw, rng, SIZE, accent)
    overlay = overlay.filter(ImageFilter.GaussianBlur(rng.choice([0, 0, 1, 2])))
    img = Image.alpha_composite(img, overlay)

    # vignette
    vign = Image.new("L", (SIZE, SIZE), 0)
    vd = ImageDraw.Draw(vign)
    vd.ellipse([-SIZE * 0.3, -SIZE * 0.3, SIZE * 1.3, SIZE * 1.3], fill=255)
    vign = vign.filter(ImageFilter.GaussianBlur(SIZE * 0.15))
    dark = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 130))
    img = Image.composite(img, Image.alpha_composite(img, dark), vign)

    draw = ImageDraw.Draw(img)
    margin = int(SIZE * 0.08)
    title_font = load_font(int(SIZE * 0.075), bold=True)
    artist_font = load_font(int(SIZE * 0.042))

    title_lines = wrap_text(draw, title.upper(), title_font, SIZE - margin * 2)
    y = SIZE - margin - len(title_lines) * int(SIZE * 0.09) - int(SIZE * 0.06)
    for line in title_lines:
        draw.text((margin, y), line, font=title_font, fill=(255, 255, 255, 235))
        y += int(SIZE * 0.085)
    draw.text((margin, y + int(SIZE * 0.01)), artist.upper(), font=artist_font, fill=accent + (255,))

    # sello discografico ficticio, esquina superior
    label_font = load_font(int(SIZE * 0.03))
    draw.text((margin, margin), "SURCO • EDICIÓN ORIGINAL", font=label_font, fill=(255, 255, 255, 160))

    img = img.convert("RGB")
    img = add_grain(img, amount=6)
    out_path = os.path.join(OUT_DIR, f"{slug}.jpg")
    img.save(out_path, quality=90)
    return out_path


ALBUMS = [
    ("marea-baja", "Marea Baja", "Los Cometas Pálidos", "indie_rock"),
    ("vidrio", "Vidrio", "Aurora Seca", "electronica"),
    ("humo-de-domingo", "Humo de Domingo", "Cigarra Roja", "soul_jazz"),
    ("satelite-domestico", "Satélite Doméstico", "Fósforo", "indie_rock"),
    ("nocturama-vol-2", "Nocturama Vol. 2", "DJ Ceniza", "electronica"),
    ("tinta-y-sal", "Tinta y Sal", "Marola", "soul_jazz"),
    ("kilometro-cero", "Kilómetro Cero", "Los Cometas Pálidos", "indie_rock"),
    ("campo-magnetico", "Campo Magnético", "Aurora Seca", "electronica"),
    ("bajo-fondo", "Bajo Fondo", "Río Tinto Trío", "soul_jazz"),
    ("antenas", "Antenas", "Fósforo", "indie_rock"),
    ("friccion", "Fricción", "Circuito Norte", "electronica"),
    ("aguas-quietas", "Aguas Quietas", "Marola", "soul_jazz"),
    ("cinta-adhesiva", "Cinta Adhesiva", "Los Cometas Pálidos", "indie_rock"),
    ("paralelo-40", "Paralelo 40", "DJ Ceniza", "electronica"),
    ("sombra-larga", "Sombra Larga", "Cigarra Roja", "soul_jazz"),
    ("radiofrecuencia", "Radiofrecuencia", "Circuito Norte", "electronica"),
    ("ceniza-y-vidrio", "Ceniza y Vidrio", "Fósforo", "indie_rock"),
    ("bitacora", "Bitácora", "Río Tinto Trío", "soul_jazz"),
    ("litoral", "Litoral", "Marola", "soul_jazz"),
    ("interferencia", "Interferencia", "DJ Ceniza & Circuito Norte", "electronica"),
]

if __name__ == "__main__":
    for i, (slug, title, artist, genre) in enumerate(ALBUMS):
        seed = int(hashlib.sha1(slug.encode()).hexdigest(), 16) % (2**32)
        path = generate_cover(slug, title, artist, genre, seed)
        print("ok", path)
