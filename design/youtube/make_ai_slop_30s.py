from __future__ import annotations

import argparse
import json
import os
import subprocess
import textwrap
import time
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

import requests
from google import genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "generated-ai-slop-video-30s"
UPLOADED_FACE_SOURCE = OUT / "assets" / "uploaded-face-reference.png"
FACE_SOURCE = ROOT / "thumb-D-human.png"
SIZE = (1920, 1080)
FPS = 30
TARGET_DURATION = 30.0
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
VEO_MODEL = "veo-3.1-fast-generate-preview"
NEGATIVE_PROMPT = (
    "logos, brand names, readable paragraphs, malformed text, horror tone, uncanny faces, "
    "distorted hands, extra fingers, weapons, gore, political symbols"
)

SCRIPT = """
I made an AI slop detector, and it is brutally simple.
If the content sounds smart but teaches nothing, it fails.
Test one: specificity. Can I copy one concrete move after watching?
Test two: proof. Did you show receipts, or just make a big claim with jump cuts?
Test three: taste. Did a human edit the draft, or did you publish the first thing the model coughed up?
That is the whole detector: specificity, proof, taste.
AI is not automatically slop. But content with no receipts and no human judgment? Beep. Straight in the bucket.
"""

SCENES = [
    {
        "id": "00-hook",
        "title": "AI SLOP DETECTOR",
        "duration": 8.0,
        "caption": "I made an AI slop detector.",
        "beats": ["AI SLOP DETECTOR", "USEFUL OR SLOP?"],
        "dialogue": "I made an AI slop detector. If content sounds smart but teaches nothing, it fails.",
        "veo_prompt": (
            "Use the reference person as the on-camera host. A fast informal YouTube cold open: "
            "the host at a cinematic creator desk reacts to a glowing AI slop detector meter, "
            "chaotic abstract AI content cards fly past, playful alarm energy, expressive but natural face, "
            "talking-to-camera cadence, shallow depth of field, no readable text. "
            "The host says exactly: \"I made an AI slop detector. If content sounds smart but teaches nothing, it fails.\""
        ),
    },
    {
        "id": "01-specificity",
        "title": "TEST 1",
        "duration": 8.0,
        "caption": "Specificity: can I copy one concrete move?",
        "beats": ["TEST 1", "SPECIFICITY"],
        "dialogue": "Test one: specificity. Can I copy one concrete move after watching?",
        "veo_prompt": (
            "Use the reference person as the host. The host points at two floating abstract cards: "
            "one vague shiny AI claim gets rejected, one practical workflow card gets approved. "
            "Funny creator-style reaction pacing, natural speaking face, energetic hand gestures, "
            "clean studio lighting, no readable text. "
            "The host says exactly: \"Test one: specificity. Can I copy one concrete move after watching?\""
        ),
    },
    {
        "id": "02-proof-taste",
        "title": "TESTS 2 + 3",
        "duration": 8.0,
        "caption": "Proof and taste: show receipts, then edit the draft.",
        "beats": ["PROOF", "TASTE"],
        "dialogue": "Test two: proof. Show receipts. Test three: taste. Did a human edit the draft?",
        "veo_prompt": (
            "Use the reference person as the host. The host opens a messy evidence board of abstract receipts, "
            "before-after panels, and a rough AI draft being marked up with a red pen. Comedic practical "
            "YouTube explainer energy, expressive natural face, speaking to camera, no readable text. "
            "The host says exactly: \"Test two: proof. Show receipts. Test three: taste. Did a human edit the draft?\""
        ),
    },
    {
        "id": "03-rule",
        "title": "THE RULE",
        "duration": 6.0,
        "caption": "Specificity, proof, taste. Otherwise: bucket.",
        "beats": ["THE RULE", "BEEP: BUCKET"],
        "dialogue": "Specificity, proof, taste. No receipts and no judgment? Beep. Straight in the bucket.",
        "veo_prompt": (
            "Use the reference person as the host. Final punchline shot: the host gives a confident verdict "
            "as the AI slop detector stamps abstract content cards, one useful card survives and one falls "
            "into a glowing bucket. Fast satisfying ending, creator desk, natural speaking face, no readable text. "
            "The host says exactly: \"Specificity, proof, taste. No receipts and no judgment? Beep. Straight in the bucket.\""
        ),
    },
]


@dataclass
class Paths:
    out: Path
    veo: Path
    scenes: Path
    assets: Path
    elevenlabs_sts: Path
    final: Path
    voiceover: Path
    captions_srt: Path
    captions_ass: Path
    face_reference: Path


def paths() -> Paths:
    return Paths(
        out=OUT,
        veo=OUT / "veo",
        scenes=OUT / "scenes",
        assets=OUT / "assets",
        elevenlabs_sts=OUT / "elevenlabs-sts",
        final=OUT / "ai-slop-detector-30s-face-sync.mp4",
        voiceover=OUT / "voiceover.mp3",
        captions_srt=OUT / "captions.srt",
        captions_ass=OUT / "captions.ass",
        face_reference=OUT / "assets" / "face-reference.png",
    )


def load_dotenv() -> None:
    for env_path in [ROOT / ".env", ROOT.parent / ".env"]:
        if not env_path.exists():
            continue
        for raw in env_path.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def run(cmd: list[str], cwd: Path = ROOT) -> None:
    subprocess.run(cmd, cwd=cwd, check=True)


def run_capture(cmd: list[str], cwd: Path = ROOT) -> str:
    return subprocess.check_output(cmd, cwd=cwd, text=True).strip()


def google_key() -> str:
    return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Set {name}.")
    return value


def ensure_credentials(skip_veo: bool, skip_tts: bool) -> None:
    missing: list[str] = []
    if not skip_veo and not google_key():
        missing.append("GEMINI_API_KEY or GOOGLE_API_KEY")
    if not skip_tts:
        for key in ["ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID"]:
            if not os.environ.get(key):
                missing.append(key)
    if missing:
        raise RuntimeError("Missing credentials: " + ", ".join(missing))


def fnt(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(BOLD if bold else FONT, size)


def ffmpeg_escape(path: Path) -> str:
    return str(path).replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")


def make_face_reference(p: Paths) -> None:
    if UPLOADED_FACE_SOURCE.exists():
        img = Image.open(UPLOADED_FACE_SOURCE).convert("RGB")
        img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
        p.face_reference.parent.mkdir(parents=True, exist_ok=True)
        img.save(p.face_reference, quality=95)
        return
    if not FACE_SOURCE.exists():
        raise RuntimeError(f"Missing face source image: {FACE_SOURCE}")
    img = Image.open(FACE_SOURCE).convert("RGB")
    # Crop the left-side portrait from the existing thumbnail and remove text-heavy areas.
    crop = img.crop((135, 35, 690, 720))
    crop = crop.resize((768, 948), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1024, 1024), "#0b0f14")
    canvas.paste(crop, (128, 44))
    p.face_reference.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(p.face_reference, quality=95)


def types_image(path: Path) -> types.Image:
    data = path.read_bytes()
    return types.Image(imageBytes=data, mimeType="image/png")


def generate_veo_clips(p: Paths, force: bool = False) -> None:
    client = genai.Client(api_key=google_key())
    reference_images = [
        types.VideoGenerationReferenceImage(
            image=types_image(p.face_reference),
            reference_type="asset",
        )
    ]
    for scene in SCENES:
        out = p.veo / f"{scene['id']}.mp4"
        if out.exists() and not force:
            continue
        print(f"Generating Veo reference clip: {scene['id']}")
        op = client.models.generate_videos(
            model=os.environ.get("VEO_MODEL", VEO_MODEL),
            prompt=scene["veo_prompt"],
            config=types.GenerateVideosConfig(
                reference_images=reference_images,
                resolution="720p",
                duration_seconds=8,
                aspect_ratio="16:9",
                number_of_videos=1,
            ),
        )
        while not op.done:
            time.sleep(10)
            op = client.operations.get(op)
        videos = getattr(getattr(op, "response", None), "generated_videos", None)
        if not videos:
            raise RuntimeError(f"Veo returned no video for {scene['id']}")
        client.files.download(file=videos[0].video)
        videos[0].video.save(str(out))


def generate_voiceover(p: Paths, force: bool = False) -> None:
    if p.voiceover.exists() and not force:
        return
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{require_env('ELEVENLABS_VOICE_ID')}",
        headers={
            "xi-api-key": require_env("ELEVENLABS_API_KEY"),
            "accept": "audio/mpeg",
            "content-type": "application/json",
        },
        json={
            "text": " ".join(textwrap.dedent(SCRIPT).split()),
            "model_id": os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"),
            "voice_settings": {
                "stability": 0.34,
                "similarity_boost": 0.84,
                "style": 0.48,
                "use_speaker_boost": True,
            },
        },
        timeout=180,
    )
    if response.status_code >= 400:
        raise RuntimeError(f"ElevenLabs failed: {response.status_code} {response.text[:500]}")
    p.voiceover.write_bytes(response.content)


def extract_scene_audio(p: Paths, scene: dict, force: bool = False) -> Path:
    source = p.veo / f"{scene['id']}.mp4"
    out = p.elevenlabs_sts / f"{scene['id']}-veo-source.wav"
    if out.exists() and not force:
        return out
    run([
        "ffmpeg", "-y", "-i", str(source),
        "-vn", "-ac", "1", "-ar", "44100",
        "-t", f"{float(scene['duration']):.3f}", str(out),
    ])
    return out


def generate_speech_to_speech(p: Paths, scene: dict, force: bool = False) -> Path:
    out = p.elevenlabs_sts / f"{scene['id']}.mp3"
    if out.exists() and not force:
        return out
    source_audio = extract_scene_audio(p, scene, force=force)
    with source_audio.open("rb") as audio:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/speech-to-speech/{require_env('ELEVENLABS_VOICE_ID')}",
            headers={
                "xi-api-key": require_env("ELEVENLABS_API_KEY"),
                "accept": "audio/mpeg",
            },
            data={
                "model_id": os.environ.get("ELEVENLABS_STS_MODEL_ID", "eleven_multilingual_sts_v2"),
                "voice_settings": json.dumps({
                    "stability": 0.38,
                    "similarity_boost": 0.86,
                    "style": 0.18,
                    "use_speaker_boost": True,
                }),
            },
            files={"audio": (source_audio.name, audio, "audio/wav")},
            timeout=240,
        )
    if response.status_code >= 400:
        raise RuntimeError(f"ElevenLabs STS failed for {scene['id']}: {response.status_code} {response.text[:500]}")
    out.write_bytes(response.content)
    return out


def duration(path: Path) -> float:
    return float(run_capture([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", str(path),
    ]))


def atempo_filter(tempo: float) -> str:
    parts: list[str] = []
    remaining = tempo
    while remaining > 2.0:
        parts.append("atempo=2.0")
        remaining /= 2.0
    while remaining < 0.5:
        parts.append("atempo=0.5")
        remaining /= 0.5
    parts.append(f"atempo={remaining:.6f}")
    return ",".join(parts)


def fit_audio_to_duration(source: Path, out: Path, target: float) -> Path:
    source_duration = duration(source)
    tempo = max(0.01, source_duration / target)
    run([
        "ffmpeg", "-y", "-i", str(source),
        "-filter_complex",
        f"[0:a]{atempo_filter(tempo)},apad,atrim=0:{target:.3f},asetpts=N/SR/TB[a]",
        "-map", "[a]", "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k", str(out),
    ])
    return out


def ass_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def srt_time(seconds: float) -> str:
    ms = int(round((seconds - int(seconds)) * 1000))
    total = int(seconds)
    return f"{total // 3600:02d}:{(total % 3600) // 60:02d}:{total % 60:02d},{ms:03d}"


def caption_events() -> list[tuple[float, float, str]]:
    events: list[tuple[float, float, str]] = []
    cursor = 0.0
    for scene in SCENES:
        scene_duration = float(scene["duration"])
        beat_duration = scene_duration / len(scene["beats"])
        for idx, beat in enumerate(scene["beats"]):
            start = cursor + idx * beat_duration
            end = min(cursor + scene_duration, start + beat_duration)
            events.append((start, end, beat))
        cursor += scene_duration
    return events


def write_captions(p: Paths) -> None:
    srt_lines: list[str] = []
    for idx, (start, end, text) in enumerate(caption_events(), 1):
        srt_lines.extend([str(idx), f"{srt_time(start)} --> {srt_time(end)}", text, ""])
    p.captions_srt.write_text("\n".join(srt_lines), encoding="utf-8")
    header = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,76,&H00FFFFFF,&H000000FF,&H00000000,&HAA000000,-1,0,0,0,100,100,0,0,1,5,1,2,90,90,105,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = [header]
    for start, end, text in caption_events():
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Default,,0,0,0,,{{\\fad(80,80)}}{text}\n")
    p.captions_ass.write_text("".join(lines), encoding="utf-8")


def make_overlay(scene: dict, out: Path) -> None:
    img = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    accent = "#2dd4bf"
    warn = "#fb7185"
    draw.rounded_rectangle((74, 62, 540, 136), radius=8, fill=(5, 5, 7, 215), outline="#2dd4bf", width=3)
    draw.text((104, 82), scene["title"], font=fnt(32, True), fill="#ffffff")
    draw.rounded_rectangle((1270, 80, 1818, 470), radius=8, fill=(5, 5, 7, 188), outline=accent, width=3)
    if scene["id"] == "00-hook":
        draw.text((1310, 118), "DETECTOR", font=fnt(38, True), fill="#ffffff")
        draw.arc((1340, 184, 1740, 584), 205, 335, fill=warn, width=18)
        draw.arc((1340, 184, 1740, 584), 205, 285, fill=accent, width=18)
        draw.polygon([(1535, 338), (1672, 244), (1560, 374)], fill=warn)
        for idx, label in enumerate(["SOUNDS SMART", "TEACHES NOTHING", "BEEP"]):
            y = 292 + idx * 48
            draw.text((1310, y), label, font=fnt(24, True), fill="#e5e7eb")
    elif scene["id"] == "01-specificity":
        draw.text((1310, 118), "COPYABLE?", font=fnt(38, True), fill="#ffffff")
        cards = [("VAGUE CLAIM", warn), ("REAL TASK", accent), ("NEXT STEP", accent)]
        for idx, (label, color) in enumerate(cards):
            y = 188 + idx * 78
            draw.rounded_rectangle((1310, y, 1778, y + 52), radius=8, fill=(15, 15, 20, 220), outline=color, width=3)
            draw.text((1332, y + 12), label, font=fnt(24, True), fill="#ffffff")
    elif scene["id"] == "02-proof-taste":
        draw.text((1310, 118), "RECEIPTS", font=fnt(38, True), fill="#ffffff")
        for idx, label in enumerate(["BAD DRAFT", "BEFORE / AFTER", "HUMAN EDIT"]):
            x = 1310 + (idx % 2) * 230
            y = 190 + (idx // 2) * 112
            draw.rounded_rectangle((x, y, x + 205, y + 78), radius=8, fill=(15, 15, 20, 220), outline=accent if idx else warn, width=3)
            draw.text((x + 18, y + 26), label, font=fnt(20, True), fill="#ffffff")
        draw.line((1320, 392, 1768, 392), fill=warn, width=8)
        draw.text((1340, 410), "CUT THE GENERIC LINE", font=fnt(22, True), fill="#ffffff")
    else:
        draw.text((1310, 118), "VERDICT", font=fnt(38, True), fill="#ffffff")
        for idx, label in enumerate(["SPECIFIC", "PROVEN", "TASTEFUL"]):
            y = 190 + idx * 62
            draw.rounded_rectangle((1310, y, 1580, y + 44), radius=8, fill=(15, 15, 20, 220), outline=accent, width=3)
            draw.text((1330, y + 10), label, font=fnt(21, True), fill="#ffffff")
            draw.text((1620, y + 4), "PASS", font=fnt(28, True), fill=accent)
        draw.rounded_rectangle((1310, 388, 1778, 438), radius=8, fill=(251, 113, 133, 220), outline="#ffffff", width=2)
        draw.text((1390, 398), "NO RECEIPTS = BUCKET", font=fnt(23, True), fill="#050507")
    draw.rounded_rectangle((100, 786, 1820, 974), radius=8, fill=(5, 5, 7, 205), outline="#fb7185", width=3)
    draw.text((136, 824), scene["caption"], font=fnt(54, True), fill="#ffffff")
    draw.text((136, 918), "SPECIFICITY  |  PROOF  |  TASTE", font=fnt(28, True), fill="#2dd4bf")
    img.save(out)


def render_scene(p: Paths, scene: dict) -> Path:
    clip = p.veo / f"{scene['id']}.mp4"
    if not clip.exists():
        raise RuntimeError(f"Missing Veo clip: {clip}")
    overlay = p.scenes / f"{scene['id']}-overlay.png"
    out = p.scenes / f"{scene['id']}.mp4"
    make_overlay(scene, overlay)
    run([
        "ffmpeg", "-y", "-i", str(clip), "-i", str(overlay),
        "-filter_complex",
        "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p[v0];"
        "[1:v]format=rgba,colorchannelmixer=aa=0.92[ov];[v0][ov]overlay=0:0[v]",
        "-map", "[v]", "-t", f"{float(scene['duration']):.3f}",
        "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", str(out),
    ])
    return out


def render_scene_with_native_audio(p: Paths, scene: dict) -> Path:
    clip = p.veo / f"{scene['id']}.mp4"
    if not clip.exists():
        raise RuntimeError(f"Missing Veo clip: {clip}")
    overlay = p.scenes / f"{scene['id']}-overlay.png"
    out = p.scenes / f"{scene['id']}-native-audio.mp4"
    make_overlay(scene, overlay)
    run([
        "ffmpeg", "-y", "-i", str(clip), "-i", str(overlay),
        "-filter_complex",
        "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p[v0];"
        "[1:v]format=rgba,colorchannelmixer=aa=0.92[ov];[v0][ov]overlay=0:0[v]",
        "-map", "[v]", "-map", "0:a?",
        "-t", f"{float(scene['duration']):.3f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
        "-c:a", "aac", "-b:a", "192k", str(out),
    ])
    return out


def render_scene_with_sts_audio(p: Paths, scene: dict, force_sts: bool = False) -> Path:
    native_scene = render_scene_with_native_audio(p, scene)
    sts_audio = generate_speech_to_speech(p, scene, force=force_sts)
    fitted_audio = p.elevenlabs_sts / f"{scene['id']}-fit.m4a"
    fit_audio_to_duration(sts_audio, fitted_audio, float(scene["duration"]))
    out = p.scenes / f"{scene['id']}-elevenlabs-sts.mp4"
    run([
        "ffmpeg", "-y", "-i", str(native_scene), "-i", str(fitted_audio),
        "-map", "0:v", "-map", "1:a", "-t", f"{float(scene['duration']):.3f}",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out),
    ])
    return out


def assemble(p: Paths) -> None:
    scene_files = [render_scene(p, scene) for scene in SCENES]
    concat = p.out / "scenes.txt"
    concat.write_text("".join(f"file '{path}'\n" for path in scene_files), encoding="utf-8")
    silent = p.out / "video-silent.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(silent)])
    write_captions(p)
    captioned = p.out / "video-captioned.mp4"
    run([
        "ffmpeg", "-y", "-i", str(silent),
        "-vf", f"ass='{ffmpeg_escape(p.captions_ass)}'",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-an", str(captioned),
    ])
    voice_duration = duration(p.voiceover)
    tempo = max(0.5, min(2.0, voice_duration / TARGET_DURATION))
    run([
        "ffmpeg", "-y", "-i", str(captioned), "-i", str(p.voiceover),
        "-filter_complex",
        f"[1:a]atempo={tempo:.6f},volume=1.05[voice];"
        "aevalsrc=0.022*sin(2*PI*92*t)+0.014*sin(2*PI*184*t):s=48000:d=30[bed];"
        "[bed]volume=0.18[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=1[a]",
        "-map", "0:v", "-map", "[a]", "-t", "30.000",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", str(p.final),
    ])


def assemble_native_veo_audio(p: Paths) -> None:
    scene_files = [render_scene_with_native_audio(p, scene) for scene in SCENES]
    concat = p.out / "scenes-native-audio.txt"
    concat.write_text("".join(f"file '{path}'\n" for path in scene_files), encoding="utf-8")
    joined = p.out / "video-native-audio.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(joined)])
    write_captions(p)
    p.final = p.out / "ai-slop-detector-30s-veo-lipsync.mp4"
    run([
        "ffmpeg", "-y", "-i", str(joined),
        "-vf", f"ass='{ffmpeg_escape(p.captions_ass)}'",
        "-t", "30.000",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
        "-c:a", "aac", "-b:a", "192k", str(p.final),
    ])


def assemble_elevenlabs_sts_lipsync(p: Paths, force_sts: bool = False, test_seconds: float | None = None) -> None:
    scene_files = [render_scene_with_sts_audio(p, scene, force_sts=force_sts) for scene in SCENES]
    concat = p.out / "scenes-elevenlabs-sts.txt"
    concat.write_text("".join(f"file '{path}'\n" for path in scene_files), encoding="utf-8")
    joined = p.out / "video-elevenlabs-sts.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(joined)])
    write_captions(p)
    if test_seconds is not None:
        p.final = p.out / "ai-slop-detector-10s-veo-elevenlabs-lipsync-test.mp4"
        target = test_seconds
    else:
        p.final = p.out / "ai-slop-detector-30s-veo-elevenlabs-lipsync.mp4"
        target = TARGET_DURATION
    run([
        "ffmpeg", "-y", "-i", str(joined),
        "-filter_complex",
        f"[0:v]ass='{ffmpeg_escape(p.captions_ass)}',tpad=stop_mode=clone:stop_duration=1[v];"
        "[0:a]apad[a]",
        "-map", "[v]", "-map", "[a]",
        "-t", f"{target:.3f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
        "-c:a", "aac", "-b:a", "192k", str(p.final),
    ])


def verify(p: Paths) -> dict:
    probe = json.loads(run_capture([
        "ffprobe", "-v", "error", "-show_entries", "format=duration,size",
        "-show_entries", "stream=codec_type,codec_name,width,height",
        "-of", "json", str(p.final),
    ]))
    (p.out / "verification.json").write_text(json.dumps(probe, indent=2), encoding="utf-8")
    return probe


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a 30-second AI slop detector video with face reference.")
    parser.add_argument("--skip-veo", action="store_true", help="Only assemble from existing Veo clips.")
    parser.add_argument("--skip-tts", action="store_true", help="Only assemble from existing voiceover.")
    parser.add_argument("--force-veo", action="store_true")
    parser.add_argument("--force-tts", action="store_true")
    parser.add_argument("--native-veo-audio", action="store_true", help="Use Veo's generated dialogue/audio for lip sync instead of ElevenLabs.")
    parser.add_argument("--elevenlabs-sts-lipsync", action="store_true", help="Convert Veo's synced dialogue with ElevenLabs Speech-to-Speech and remux it onto the Veo video.")
    parser.add_argument("--sts-test-10s", action="store_true", help="With --elevenlabs-sts-lipsync, render the 10-second verification export.")
    args = parser.parse_args()

    load_dotenv()
    p = paths()
    for folder in [p.out, p.veo, p.scenes, p.assets, p.elevenlabs_sts]:
        folder.mkdir(parents=True, exist_ok=True)
    (p.out / "script.txt").write_text(textwrap.dedent(SCRIPT).strip() + "\n", encoding="utf-8")
    (p.out / "scene-plan.json").write_text(json.dumps(SCENES, indent=2), encoding="utf-8")
    (p.out / "generation-config.json").write_text(json.dumps({
        "veo_model": VEO_MODEL,
        "resolution": "720p",
        "aspect_ratio": "16:9",
        "clip_duration_seconds": 8,
        "final_resolution": "1920x1080",
        "final_fps": FPS,
        "target_duration_seconds": TARGET_DURATION,
        "face_source": str(UPLOADED_FACE_SOURCE if UPLOADED_FACE_SOURCE.exists() else FACE_SOURCE),
        "voice_provider": "ElevenLabs",
        "sync_note": "Use --native-veo-audio for Veo's own voice, or --elevenlabs-sts-lipsync to preserve Veo timing while converting the voice with ElevenLabs Speech-to-Speech.",
        "speech_to_speech_model": "eleven_multilingual_sts_v2",
        "negative_prompt": NEGATIVE_PROMPT,
    }, indent=2), encoding="utf-8")
    make_face_reference(p)
    ensure_credentials(args.skip_veo, args.skip_tts)
    if not args.skip_veo:
        generate_veo_clips(p, force=args.force_veo)
    if not args.skip_tts and not args.native_veo_audio and not args.elevenlabs_sts_lipsync:
        generate_voiceover(p, force=args.force_tts)
    if args.native_veo_audio:
        assemble_native_veo_audio(p)
    elif args.elevenlabs_sts_lipsync:
        assemble_elevenlabs_sts_lipsync(
            p,
            force_sts=args.force_tts,
            test_seconds=10.0 if args.sts_test_10s else None,
        )
    else:
        assemble(p)
    print(json.dumps({"final": str(p.final), "probe": verify(p)}, indent=2))


if __name__ == "__main__":
    main()
