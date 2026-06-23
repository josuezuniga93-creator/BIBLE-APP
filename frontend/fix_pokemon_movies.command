#!/bin/bash
python3 << 'EOF'
import os, shutil, subprocess, unicodedata

MOVIES = '/Volumes/MEDIA/MediaVault Library/Movies'

def nfc(s):
    return unicodedata.normalize('NFC', s)

def find_folder(name):
    """Find the actual folder on disk, regardless of Unicode normalization."""
    name_nfc = nfc(name).lower()
    for actual in os.listdir(MOVIES):
        if nfc(actual).lower() == name_nfc:
            return actual  # return the real name as stored on disk
    return None

def get_video(folder_path):
    for f in os.listdir(folder_path):
        if not f.startswith('.') and f.lower().endswith(('.mp4', '.avi', '.mkv', '.m4v')):
            return f
    return None

def safe_rename(src, dst):
    """Rename using subprocess mv to handle macOS Unicode paths reliably."""
    result = subprocess.run(['mv', src, dst], capture_output=True)
    return result.returncode == 0

def delete_dup(keep_name, dup_name):
    actual_dup = find_folder(dup_name)
    actual_keep = find_folder(keep_name)
    if not actual_dup:
        print(f'  SKIP (dup not found): {dup_name}')
        return
    if not actual_keep:
        print(f'  ERROR (keep not found): {keep_name}')
        return
    keep_path = os.path.join(MOVIES, actual_keep)
    dup_path = os.path.join(MOVIES, actual_dup)
    keep_video = get_video(keep_path)
    dup_video = get_video(dup_path)
    if not keep_video and dup_video:
        ext = os.path.splitext(dup_video)[1]
        new_video = os.path.join(keep_path, actual_keep + ext)
        subprocess.run(['mv', os.path.join(dup_path, dup_video), new_video])
        print(f'  Moved video to keep folder')
    result = subprocess.run(['rm', '-rf', dup_path], capture_output=True)
    if result.returncode == 0:
        print(f'  Deleted dup: {actual_dup}')
    else:
        print(f'  ERROR deleting: {actual_dup}')

def rename_folder(old_name, new_name):
    actual = find_folder(old_name)
    if not actual:
        print(f'  SKIP (not found): {old_name}')
        return
    new_path = os.path.join(MOVIES, new_name)
    if nfc(actual).lower() == nfc(new_name).lower():
        return  # already correct (case-insensitive match)
    if os.path.exists(new_path):
        print(f'  SKIP (dest exists): {new_name}')
        return
    actual_path = os.path.join(MOVIES, actual)
    # Rename video inside first
    video = get_video(actual_path)
    if video:
        ext = os.path.splitext(video)[1]
        expected = new_name + ext
        if nfc(video) != nfc(expected):
            safe_rename(os.path.join(actual_path, video),
                        os.path.join(actual_path, expected))
    # Rename folder
    if safe_rename(actual_path, new_path):
        print(f'  {actual} -> {new_name}')
    else:
        print(f'  ERROR renaming: {actual}')

# ── PHASE 1: Remove duplicates ────────────────────────────────
print('=== Phase 1: Removing duplicate folders ===')

delete_dup('Pokemon Giratina and the Sky Warrior',
           'Pokémon Giratina And The Sky Warrior (2008)')

delete_dup('Pokemon Lucario And The Mystery Of Mew (2005)',
           'Pokemon Lucario And The Mystery Of Mew')

delete_dup('Pokemon The First Movie Mewtwo Strikes Back (1998)',
           'Pokemon The First.Movie - Mewtwo Strikes Back (1998)')

delete_dup('Pokemon Hoopla and the Clash of Ages',
           'Pokemon The Movie Hoopa And The Clash Of Ages (2015)')

delete_dup('Pokemon White Victini and Zekrom',
           'Pokemon The Movie White Victini And Zekrom (2011)')

delete_dup('Pokemon Volcanion and the Mechanical Marvel',
           'Pokémon The Movie Volcanion And The Mechanical Marvel (2016)')

# ── PHASE 2: Fix names + add missing years ────────────────────
print('\n=== Phase 2: Fixing names and adding years ===')

renames = [
    ("Pokemon  Pikachu's Winter Vacation (1999)",   "Pokemon Pikachu's Winter Vacation (1999)"),
    ('Pokémon Detective Pikachu(2019)',              'Pokemon Detective Pikachu (2019)'),
    ('Pokemon The Movie 2000 The Power of One  (1999)', 'Pokemon The Movie 2000 The Power of One (1999)'),
    ('Pokemon The Movie Spell of the Unkown (2000)', 'Pokemon The Movie Spell of the Unown (2000)'),
    ('Pokémon The Movie The Power Of Us (2018)',    'Pokemon The Movie The Power Of Us (2018)'),
    ('Pokemon Hoopla and the Clash of Ages',         'Pokemon Hoopa and the Clash of Ages (2015)'),
    ('Pokemon Arceus and the Jewel of Life',         'Pokemon Arceus and the Jewel of Life (2009)'),
    ('Pokemon Black Victini and Reshiram',           'Pokemon Black Victini and Reshiram (2011)'),
    ('Pokemon Camp Pikachu',                         'Pokemon Camp Pikachu (2002)'),
    ('Pokemon Destiny Deoxys',                       'Pokemon Destiny Deoxys (2004)'),
    ('Pokemon Diancie and the Cocoon of Destruction','Pokemon Diancie and the Cocoon of Destruction (2014)'),
    ('Pokemon Genesect and the Legend Awakened',     'Pokemon Genesect and the Legend Awakened (2013)'),
    ('Pokemon Giratina and the Sky Warrior',         'Pokemon Giratina and the Sky Warrior (2008)'),
    ('Pokemon Gotta Dance',                          'Pokemon Gotta Dance (2003)'),
    ('Pokemon I Choose You',                         'Pokemon I Choose You (2017)'),
    ('Pokemon Jirachi Wish Maker',                   'Pokemon Jirachi Wish Maker (2003)'),
    ('Pokemon Kyurem vs. the Sword of Justice',      'Pokemon Kyurem vs. the Sword of Justice (2012)'),
    ('Pokemon Mewtwo Returns',                       'Pokemon Mewtwo Returns (2000)'),
    ('Pokemon Ranger and the Temple of the Sea',     'Pokemon Ranger and the Temple of the Sea (2006)'),
    ('Pokemon The Mastermind of Mirage Pokemon',     'Pokemon The Mastermind of Mirage Pokemon (2006)'),
    ('Pokemon The Rise Of Darkrai',                  'Pokemon The Rise of Darkrai (2007)'),
    ('Pokemon White Victini and Zekrom',             'Pokemon White Victini and Zekrom (2011)'),
    ('Pokemon Volcanion and the Mechanical Marvel',  'Pokemon Volcanion and the Mechanical Marvel (2016)'),
    ('Pokemon Zoroark Master of Illusions',          'Pokemon Zoroark Master of Illusions (2010)'),
]

for old, new in renames:
    rename_folder(old, new)

# ── PHASE 3: Fix misplaced files ─────────────────────────────
print('\n=== Phase 3: Fixing misplaced files ===')
power_folder = find_folder('Pokemon The Movie 2000 The Power of One (1999)')
if power_folder:
    folder_path = os.path.join(MOVIES, power_folder)
    for f in os.listdir(folder_path):
        if 'mewtwo strikes back' in f.lower() and f.lower().endswith('.srt'):
            os.remove(os.path.join(folder_path, f))
            print(f'  Removed misplaced file: {f}')
            break
    else:
        print('  No misplaced .srt found (already clean)')
else:
    print('  Power of One folder not found')

# ── PHASE 4: Sync video filenames to folder names ─────────────
print('\n=== Phase 4: Syncing video filenames to folder names ===')
count = 0
for folder_name in sorted(os.listdir(MOVIES)):
    if 'pokemon' not in nfc(folder_name).lower() and 'pokémon' not in nfc(folder_name).lower():
        continue
    folder_path = os.path.join(MOVIES, folder_name)
    if not os.path.isdir(folder_path):
        continue
    video = get_video(folder_path)
    if video:
        ext = os.path.splitext(video)[1]
        expected = folder_name + ext
        if nfc(video) != nfc(expected):
            safe_rename(os.path.join(folder_path, video),
                        os.path.join(folder_path, expected))
            print(f'  {video} -> {expected}')
            count += 1
if count == 0:
    print('  All video filenames already match their folder names.')

print('\n=== Done! All Pokemon movies fixed. ===')
EOF
echo ""
echo "Press any key to close..."
read -n 1
