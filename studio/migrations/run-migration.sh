#!/bin/bash

# Ins Studio-Verzeichnis wechseln
cd "$(dirname "$0")/.."

# Dependencies installieren
echo "Installiere Dependencies..."
pnpm add -D tsx @types/node dotenv

# Migration ausführen
echo "Führe Migration aus..."
pnpm exec tsx migrations/addons.ts