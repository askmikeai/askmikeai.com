# Business card — how to order

**Ready to upload:** `business-card-front.pdf` and `business-card-back.pdf` —
print-ready vector PDFs at 3.75" × 2.25" (3.5×2 trim + 0.125" bleed), fonts
embedded. Most printers (Moo / Vistaprint / GotPrint) accept these directly.

Source (editable): `business-card-front.svg`, `business-card-back.svg`.

Specs:
- Final card: **3.5" × 2"** (US standard).
- Art is **3.75" × 2.25" @ 300 DPI** (1125 × 675 px) = trim + **0.125" bleed** on all sides.
- Keep important text inside the safe area (≈0.125" inside the trim) — already done.

Before sending to a printer:
1. **Convert text to outlines** (Illustrator/Inkscape: Select all → Object > Path > Outline / Text > Create Outlines) so fonts render identically anywhere. The card uses Arial/Helvetica as a safe fallback.
2. **Export to print PDF** (or PDF/X-1a). Most printers (Moo, Vistaprint, GotPrint) accept PDF.
3. If your printer requires **CMYK**, convert in your editor; the on-screen colors are RGB brand colors and may shift slightly in CMYK.
4. The back QR points to `wa.me/17542959900` — scan-test the printed proof before a full run.

Quick convert with Inkscape (CLI):
```
inkscape business-card-front.svg --export-type=pdf --export-filename=front.pdf
inkscape business-card-back.svg  --export-type=pdf --export-filename=back.pdf
```
