"""Optimise nocty-welcome.gif : 720x720 14MB → 240x240 ~1.8MB"""
from PIL import Image
import os

src = os.path.join(os.path.dirname(__file__), 'assets', 'nocty-welcome.gif')
dst = os.path.join(os.path.dirname(__file__), 'assets', 'nocty-welcome-anim.gif')

img = Image.open(src)
print(f"Source: {img.size}, {img.n_frames} frames, {os.path.getsize(src)/1024/1024:.1f} MB")

frames = []
for i in range(img.n_frames):
    img.seek(i)
    frame = img.convert('RGBA').resize((240, 240), Image.LANCZOS)
    alpha = frame.split()[3]
    frame_p = frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=128)
    mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
    frame_p.paste(128, mask)
    frames.append(frame_p)

frames[0].save(dst, save_all=True, append_images=frames[1:],
               duration=img.info.get('duration', 40), loop=0, transparency=128, disposal=2)
print(f"Output: 240x240, {len(frames)} frames, {os.path.getsize(dst)/1024/1024:.1f} MB → {dst}")
