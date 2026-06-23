#!/bin/bash
python3 << 'EOF'
import os, subprocess, unicodedata

MOVIES = '/Volumes/MEDIA/MediaVault Library/Movies'

def nfc(s):
    return unicodedata.normalize('NFC', s)

# 1. Delete the remaining White Victini duplicate
dup = 'Pokemon The Movie White Victini And Zekrom (2011)'
dup_path = os.path.join(MOVIES, dup)
if os.path.exists(dup_path):
    result = subprocess.run(['rm', '-rf', dup_path], capture_output=True)
    if result.returncode == 0:
        print(f'Deleted: {dup}')
    else:
        print(f'ERROR deleting: {dup}')
else:
    print(f'Already gone: {dup}')

# 2. Find and fix the Power Of Us folder (NFD accent + trailing space)
target_clean = 'Pokemon The Movie The Power Of Us (2018)'
for actual in os.listdir(MOVIES):
    if 'power of us' in nfc(actual).lower():
        actual_path = os.path.join(MOVIES, actual)
        target_path = os.path.join(MOVIES, target_clean)
        if actual != target_clean:
            # Rename video inside first
            for f in os.listdir(actual_path):
                if not f.startswith('.') and f.lower().endswith(('.mp4', '.avi', '.mkv', '.m4v')):
                    ext = os.path.splitext(f)[1]
                    new_video = os.path.join(actual_path, target_clean + ext)
                    subprocess.run(['mv', os.path.join(actual_path, f), new_video])
                    print(f'  Renamed video: {f} -> {target_clean}{ext}')
                    break
            # Rename folder
            result = subprocess.run(['mv', actual_path, target_path], capture_output=True)
            if result.returncode == 0:
                print(f'Fixed: {repr(actual)}')
                print(f'    -> {target_clean}')
            else:
                print(f'ERROR: {result.stderr.decode()}')
        else:
            print(f'Already correct: {target_clean}')
        break
else:
    print('Power Of Us folder not found!')

print('\nDone! Final cleanup complete.')
EOF
echo ""
echo "Press any key to close..."
read -n 1
