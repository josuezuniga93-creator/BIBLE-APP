#!/bin/bash
python3 << 'EOF'
import os

MOVIES = '/Volumes/MEDIA/MediaVault Library/Movies'

pokemon_folders = []
for name in sorted(os.listdir(MOVIES)):
    if 'pokemon' in name.lower() or 'pokémon' in name.lower() or 'pokémon' in name.lower():
        path = os.path.join(MOVIES, name)
        contents = os.listdir(path)
        pokemon_folders.append((name, contents))

for name, contents in pokemon_folders:
    print(f"[{len(contents)} items] {name}")
    for f in contents:
        print(f"  → {f}")
    print()

print(f"Total Pokemon folders: {len(pokemon_folders)}")
EOF
echo ""
echo "Press any key to close..."
read -n 1
