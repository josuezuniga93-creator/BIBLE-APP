#!/bin/bash
python3 << 'EOF'
import os, unicodedata

MOVIES = '/Volumes/MEDIA/MediaVault Library/Movies'

print("=== Current state of all Pokemon folders ===\n")
count = 0
for f in sorted(os.listdir(MOVIES)):
    nfc = unicodedata.normalize('NFC', f).lower()
    if 'pokemon' in nfc or 'pokémon' in nfc or 'é' in nfc:
        # Show the raw repr so we can see Unicode bytes
        print(f"  {f}")
        count += 1

print(f"\nTotal: {count} Pokemon folders")
print("\n=== Folders that still have 'Pokémon' accent ===")
for f in sorted(os.listdir(MOVIES)):
    if 'pok' in f.lower() and '\xe9' in f:  # é in NFC
        print(f"  ACCENT: {repr(f)}")
    elif 'pok' in f.lower() and 'é' in f:  # NFD e + combining accent
        print(f"  ACCENT (NFD): {repr(f)}")
EOF
echo ""
echo "Press any key to close..."
read -n 1
