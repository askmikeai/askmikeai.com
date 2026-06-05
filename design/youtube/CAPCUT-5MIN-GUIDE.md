# AskMikeAI — 5-minute YouTube video kit (CapCut)

> Native `.psd` and `.capcut` template **files** can only be made inside Photoshop / the
> CapCut app. This kit is the practical equivalent: a thumbnail template + brand slides
> you import as images, plus the exact timeline to assemble in CapCut.

## Brand specs (match the website)
- **Background:** `#131316` (near-black)
- **Gradient:** pink `#db2777` → coral `#fb7185` → teal `#14b8a6`
- **Accent teal:** `#2dd4bf`
- **Font:** a bold geometric sans — *Inter* / *Montserrat* / *Poppins* (Arial works as fallback)
- **Motif:** the 4-point sparkle + soft pink/teal glows + a gradient left "spine"

## Assets in this folder
| File | Use | Size |
|---|---|---|
| `thumbnail-template.svg/.png` | YouTube thumbnail (edit title, drop a photo in the frame) | 1280×720 |
| `slide-01-intro.png` | Opening title card (0:00–0:08) | 1920×1080 |
| `slide-02-section.png` | Section divider — **also use as the transition card** | 1920×1080 |
| `slide-03-lower-third.png` | Name/handle lower-third (transparent PNG → overlay) | 1920×1080 |
| `slide-04-subscribe.png` | Mid-roll subscribe CTA | 1920×1080 |
| `slide-05-outro.png` | End screen | 1920×1080 |

SVGs are the editable source (change text in Figma/Illustrator/Canva, re-export PNG).

## 5-minute timeline (≈300s)
| Time | Segment | What's on screen |
|---|---|---|
| 0:00–0:08 | **Hook** | `slide-01-intro` over your first line; punchy promise |
| 0:08–0:20 | **Cold open / problem** | You on cam + `slide-03-lower-third` (first 5s) |
| 0:20–0:25 | **Transition** | `slide-02-section` "01 · …" (0.5–1s, with a whoosh) |
| 0:25–1:40 | **Point 1** | talking-head + B-roll/screen-rec; captions on |
| 1:40–1:45 | **Transition** | `slide-02-section` "02 · …" |
| 1:45–3:00 | **Point 2** | demo / screen recording |
| 3:00–3:08 | **Subscribe bump** | `slide-04-subscribe` (slide up from bottom, 6–8s) |
| 3:08–3:13 | **Transition** | `slide-02-section` "03 · …" |
| 3:13–4:35 | **Point 3 / payoff** | the result; show, don't tell |
| 4:35–4:50 | **Recap + CTA** | 3 bullets; "back the build / link below" |
| 4:50–5:00 | **Outro** | `slide-05-outro` + end-screen cards |

## Build it in CapCut (steps)
1. **New project**, set canvas **16:9 / 1080p**.
2. Drag your **footage** to the main track. Cut on the beats above.
3. **Import** the slide PNGs (Media → Import). Drop each on an **overlay track** at its timestamp.
4. **Transitions:** between cuts, add CapCut's **Pull / Zoom / Glitch** transition (~0.3–0.5s). For section changes, place `slide-02-section` for ~0.8s with a **whoosh** SFX.
5. **Lower-third:** put `slide-03-lower-third.png` on an overlay track, **Animation → In: Slide (left)**, Out: Fade. Show ~5s when you first appear.
6. **Subscribe bump:** `slide-04-subscribe.png`, Animation In: **Slide up**, hold 6–8s, Out: Slide down.
7. **Captions:** Text → Auto-captions. Font Montserrat/Poppins **Bold**, white, thin dark stroke; keep 1–2 lines.
8. **Color:** add a subtle **teal/magenta** tint LUT or a light gradient overlay (very low opacity) so footage matches the brand.
9. **Music:** low-energy lofi/electronic bed at ~-22 LUFS under VO; duck under speech.
10. **Export:** 1080p, 30/60fps, high bitrate. Thumbnail: open `thumbnail-template`, change the title + drop your photo in the frame, export 1280×720 JPG/PNG.

## Tips
- Keep the **first 8 seconds** ruthless — restate the promise from the thumbnail.
- Reuse `slide-02-section` for every transition so the video feels consistent.
- Thumbnail + title should make the **same promise** (CTR ↑).
