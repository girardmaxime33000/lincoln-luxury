#!/usr/bin/env python3
"""
generate_qr.py — Lincoln Luxury tip & review page QR code.

Generates a print-ready QR code pointing at the deployed tip/review page,
plus a designed passenger card (chevalet / sticker) that embeds it.

Requirements:
    pip install "qrcode[pil]" Pillow

Usage:
    python generate_qr.py

Outputs (written next to this script, in ./output/):
    qr_code.png   — high-resolution QR code, transparent-safe, print quality
    qr_code.svg   — vector QR code (infinitely scalable, ideal for print shops)
    tip_card.png  — 300 DPI passenger card (10 x 15 cm) with the QR embedded,
                    ready to send to a printer for a seatback chevalet/sticker
"""

import os

import qrcode
import qrcode.image.svg
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# CONFIG — edit this before running.
# ---------------------------------------------------------------------------

# Final URL of the deployed page (see README.md for deployment options).
TARGET_URL = "https://www.lincoln-luxury.fr/tip/"

# Text printed on the passenger card. Keep it short — it has to be readable
# from the back seat.
CARD_TITLE = "Thank you for riding!"
CARD_SUBTITLE = "Scan to tip & leave a review"
CARD_FOOTER = "Lincoln Luxury — Bordeaux"

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")

# Card size at 300 DPI (10 x 15 cm — a standard seatback card format).
CARD_DPI = 300
CARD_WIDTH_CM = 10
CARD_HEIGHT_CM = 15

# Brand palette, matching the page.
COLOR_BG = (11, 11, 13)          # near-black
COLOR_CARD = (25, 24, 29)
COLOR_GOLD = (203, 161, 53)
COLOR_TEXT = (244, 239, 228)
COLOR_TEXT_DIM = (183, 178, 168)

# Self-hosted brand fonts already shipped with the site.
FONT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "fonts")
FONT_TITLE = os.path.join(FONT_DIR, "playfair-display-700.ttf")
FONT_BODY = os.path.join(FONT_DIR, "jost-400.ttf")


def cm_to_px(cm: float, dpi: int) -> int:
    return int(round(cm / 2.54 * dpi))


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        # Falls back to PIL's built-in bitmap font if the TTF isn't found —
        # the script still runs, just with a plainer card.
        return ImageFont.load_default()


def make_qr(url: str):
    """Builds a high error-correction QR code (level H): still scannable
    even printed small, folded, or partly covered by a sticker/logo."""
    qr = qrcode.QRCode(
        version=None,  # auto-sized to the data
        error_correction=ERROR_CORRECT_H,
        box_size=20,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    return qr


def save_png(qr, path: str):
    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    img.save(path, dpi=(600, 600))
    return img


def save_svg(url: str, path: str):
    factory = qrcode.image.svg.SvgPathImage
    img = qrcode.make(
        url,
        image_factory=factory,
        error_correction=ERROR_CORRECT_H,
        box_size=20,
        border=4,
    )
    img.save(path)


def make_card(qr_img: Image.Image, path: str):
    w = cm_to_px(CARD_WIDTH_CM, CARD_DPI)
    h = cm_to_px(CARD_HEIGHT_CM, CARD_DPI)

    card = Image.new("RGB", (w, h), COLOR_BG)
    draw = ImageDraw.Draw(card)

    margin = int(w * 0.09)
    max_text_w = w - margin * 2

    def fit_font(text, path, start_size, min_size=10):
        size = start_size
        while size > min_size:
            font = load_font(path, size)
            bbox = draw.textbbox((0, 0), text, font=font)
            if bbox[2] - bbox[0] <= max_text_w:
                return font
            size -= 2
        return load_font(path, min_size)

    title_font = fit_font(CARD_TITLE, FONT_TITLE, int(w * 0.135))
    sub_font = fit_font(CARD_SUBTITLE, FONT_BODY, int(w * 0.045))
    footer_font = load_font(FONT_BODY, int(w * 0.035))

    # Title
    title_bbox = draw.textbbox((0, 0), CARD_TITLE, font=title_font)
    draw.text(
        ((w - (title_bbox[2] - title_bbox[0])) / 2, int(h * 0.10)),
        CARD_TITLE, font=title_font, fill=COLOR_TEXT,
    )

    # Subtitle
    sub_bbox = draw.textbbox((0, 0), CARD_SUBTITLE, font=sub_font)
    draw.text(
        ((w - (sub_bbox[2] - sub_bbox[0])) / 2, int(h * 0.20)),
        CARD_SUBTITLE, font=sub_font, fill=COLOR_GOLD,
    )

    # QR code, centered, on a light rounded panel for contrast/scannability.
    qr_target_w = w - margin * 2
    qr_resized = qr_img.resize((qr_target_w, qr_target_w), Image.NEAREST)

    panel_pad = int(w * 0.05)
    panel_size = qr_target_w + panel_pad * 2
    panel_y = int(h * 0.30)
    panel = Image.new("RGB", (panel_size, panel_size), (255, 255, 255))
    try:
        mask = Image.new("L", (panel_size, panel_size), 0)
        mdraw = ImageDraw.Draw(mask)
        radius = int(panel_size * 0.06)
        mdraw.rounded_rectangle([0, 0, panel_size, panel_size], radius=radius, fill=255)
        rounded_panel = Image.new("RGB", (panel_size, panel_size), COLOR_BG)
        rounded_panel.paste(panel, (0, 0), mask)
        panel = rounded_panel
    except AttributeError:
        pass  # older Pillow without rounded_rectangle: square panel is fine

    panel.paste(qr_resized, (panel_pad, panel_pad))
    card.paste(panel, ((w - panel_size) // 2, panel_y))

    # Footer
    footer_bbox = draw.textbbox((0, 0), CARD_FOOTER, font=footer_font)
    draw.text(
        ((w - (footer_bbox[2] - footer_bbox[0])) / 2, int(h * 0.94)),
        CARD_FOOTER, font=footer_font, fill=COLOR_TEXT_DIM,
    )

    card.save(path, dpi=(CARD_DPI, CARD_DPI))


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    qr = make_qr(TARGET_URL)

    png_path = os.path.join(OUTPUT_DIR, "qr_code.png")
    svg_path = os.path.join(OUTPUT_DIR, "qr_code.svg")
    card_path = os.path.join(OUTPUT_DIR, "tip_card.png")

    qr_img = save_png(qr, png_path)
    save_svg(TARGET_URL, svg_path)
    make_card(qr_img, card_path)

    print("Target URL:", TARGET_URL)
    print("Written:")
    print(" -", png_path)
    print(" -", svg_path)
    print(" -", card_path)


if __name__ == "__main__":
    main()
