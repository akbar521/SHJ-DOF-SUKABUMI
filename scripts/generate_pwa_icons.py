#!/usr/bin/env python3
import struct
import zlib
import math
import os

def create_png(width, height, pixel_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = pixel_func(x, y, width, height)
            raw_data.extend((int(r), int(g), int(b), int(a)))
    
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    def chunk(chunk_type, data):
        length = len(data)
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', length) + chunk_type + data + struct.pack('>I', crc)
    
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png_bytes = (
        b'\x89PNG\r\n\x1a\n' +
        chunk(b'IHDR', ihdr) +
        chunk(b'IDAT', compressed) +
        chunk(b'IEND', b'')
    )
    
    with open(filename, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {filename} ({width}x{height})")

def clamp(val, min_v=0, max_v=255):
    return max(min_v, min(max_v, val))

def icon_pixel(x, y, w, h, is_maskable=False):
    # Normalized coords from 0.0 to 1.0
    nx = x / float(w)
    ny = y / float(h)
    
    # Emerald gradient base
    t = (nx + ny) / 2.0
    bg_r = 4 + t * (5 - 4)
    bg_g = 120 + t * (150 - 120)
    bg_b = 87 + t * (105 - 87)
    
    # Rounded corners for non-maskable
    if not is_maskable:
        corner_r = 0.22  # radius ratio
        dx = max(0, abs(nx - 0.5) - (0.5 - corner_r))
        dy = max(0, abs(ny - 0.5) - (0.5 - corner_r))
        dist = math.sqrt(dx*dx + dy*dy)
        if dist > corner_r:
            return (0, 0, 0, 0)  # Transparent outside rounded rect
    
    # Scale center content
    scale = 0.75 if is_maskable else 0.85
    cx = (nx - 0.5) / scale + 0.5
    cy = (ny - 0.5) / scale + 0.5
    
    # Clipboard Card rect: x in [0.24, 0.76], y in [0.20, 0.82], corner radius 0.06
    if 0.18 <= cx <= 0.82 and 0.18 <= cy <= 0.84:
        # Card rounded rect check
        card_r = 0.08
        cdx = max(0, abs(cx - 0.5) - (0.28 - card_r))
        cdy = max(0, abs(cy - 0.51) - (0.33 - card_r))
        if math.sqrt(cdx*cdx + cdy*cdy) <= card_r:
            # Inside card
            # Top clip
            if 0.38 <= cx <= 0.62 and 0.14 <= cy <= 0.22:
                return (4, 120, 87, 255)
            # Clip hole
            if 0.44 <= cx <= 0.56 and 0.17 <= cy <= 0.19:
                return (240, 253, 244, 255)
            
            # Badge circle in bottom center
            badge_dx = cx - 0.5
            badge_dy = cy - 0.66
            badge_dist = math.sqrt(badge_dx*badge_dx + badge_dy*badge_dy)
            if badge_dist <= 0.12:
                # Inside green circle badge
                # Checkmark
                # Checkmark lines: (-0.05, -0.01) to (-0.01, 0.03) to (0.05, -0.04)
                # Distance to segments
                # Segment 1
                p1x, p1y = -0.045, -0.005
                p2x, p2y = -0.012, 0.032
                p3x, p3y = 0.050, -0.035
                
                # Check line thickness ~0.018
                def dist_to_segment(px, py, ax, ay, bx, by):
                    l2 = (bx - ax)**2 + (by - ay)**2
                    if l2 == 0: return math.hypot(px - ax, py - ay)
                    t = max(0, min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2))
                    proj_x = ax + t * (bx - ax)
                    proj_y = ay + t * (by - ay)
                    return math.hypot(px - proj_x, py - proj_y)
                
                d1 = dist_to_segment(badge_dx, badge_dy, p1x, p1y, p2x, p2y)
                d2 = dist_to_segment(badge_dx, badge_dy, p2x, p2y, p3x, p3y)
                if min(d1, d2) <= 0.018:
                    return (255, 255, 255, 255)
                return (16, 185, 129, 255)
            
            # Header banner
            if 0.26 <= cx <= 0.74 and 0.26 <= cy <= 0.33:
                return (236, 253, 245, 255)
            # Text lines on card
            if (0.26 <= cx <= 0.55 and 0.38 <= cy <= 0.41) or (0.60 <= cx <= 0.74 and 0.38 <= cy <= 0.41):
                return (5, 150, 105, 255)
            if (0.26 <= cx <= 0.48 and 0.45 <= cy <= 0.48) or (0.52 <= cx <= 0.74 and 0.45 <= cy <= 0.48):
                return (148, 163, 184, 255)
            if (0.26 <= cx <= 0.52 and 0.52 <= cy <= 0.55) or (0.56 <= cx <= 0.70 and 0.52 <= cy <= 0.55):
                return (203, 213, 225, 255)
            
            # Base card color
            return (255, 255, 255, 255)

    # Outer background
    return (bg_r, bg_g, bg_b, 255)

os.makedirs('public', exist_ok=True)

create_png(192, 192, lambda x, y, w, h: icon_pixel(x, y, w, h, False), 'public/pwa-192x192.png')
create_png(512, 512, lambda x, y, w, h: icon_pixel(x, y, w, h, False), 'public/pwa-512x512.png')
create_png(512, 512, lambda x, y, w, h: icon_pixel(x, y, w, h, True), 'public/pwa-maskable-512x512.png')
create_png(180, 180, lambda x, y, w, h: icon_pixel(x, y, w, h, False), 'public/apple-touch-icon.png')
create_png(64, 64, lambda x, y, w, h: icon_pixel(x, y, w, h, False), 'public/favicon.ico')
print("All icons successfully generated!")
