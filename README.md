# Suppression Spells

An OpenMW mod that adds **Lillemare**, a High Elf Sorcerer, to the Central Tower in Tel Vos. Complete a short fetch quest to learn six **Suppression** spells — Suppress Magicka and Suppress Enchantment in Self, Touch, and Target variants.

## Description

Lillemare has set up near the Steam Centurion exhibit in Tel Vos's Central Tower. She offers to teach powerful suppression magic, but first requires 5 **Hackle-Lo Leaf** for her research.

### Spells

| Spell | Effect | Range | Magicka |
|-------|--------|-------|---------|
| Suppress Magicka (Self) | Reduce cast spell effects | Self | 10 |
| Suppress Magicka (Touch) | Reduce cast spell effects | Touch | 10 |
| Suppress Magicka (Target) | Reduce cast spell effects | Target | 15 |
| Suppress Enchantment (Self) | Reduce enchantment effects | Self | 10 |
| Suppress Enchantment (Touch) | Reduce enchantment effects | Touch | 10 |
| Suppress Enchantment (Target) | Reduce enchantment effects | Target | 15 |

Each spell's magnitude equals the percentage reduction applied to the target (**0–20%**, rolled per cast) for **10 seconds**. Cast success uses Mysticism and the spell's magicka cost (see [SUPPRESSION_DEV.md](SUPPRESSION_DEV.md)).

Gameplay reference (what is and is not suppressed): **[SUPPRESSION_RULES.md](SUPPRESSION_RULES.md)**.

## Installation instructions

**Requires OpenMW 0.51 or newer.**

1. Install [OpenMW](https://openmw.org/) 0.51+ with a normal Morrowind data setup (base game; Tribunal and Bloodmoon recommended).
2. Extract this archive so you have a folder (for example `supression-spells`) containing:
   - `supression_spells.omwscripts`
   - `supression_spells_dialogue.omwaddon`
   - `scripts/`
   - `icons/`
   - `l10n/`
3. Place that folder on your OpenMW **data path** — for example next to other mods:
   - `...\OpenMW 0.51.0\data\supression-spells\`
4. Open **OpenMW Launcher** → **Data Files** and enable the folder.
5. Enable **`supression_spells_dialogue.omwaddon`** after `Morrowind.esm` for the NPC, dialogue, and journal entries.
6. Launch the game. Visit Lillemare in **Tel Vos, Central Tower**.

Rebuild the plugin after editing dialogue: `node tools/build_esp.mjs`.

Spell behavior (gameplay reference): [SUPPRESSION_RULES.md](SUPPRESSION_RULES.md). Technical details: [SUPPRESSION_DEV.md](SUPPRESSION_DEV.md). Dialogue source notes: [Dialogue.md](Dialogue.md).

## Quest walkthrough

1. Travel to **Tel Vos, Central Tower** and speak with **Lillemare** (near the Steam Centurion exhibit).
2. She asks you to bring **5 Hackle-Lo Leaf**.
3. Gather the leaves and return. Choose **"Yes, I have brought the Hackle-Lo Leaf"** when prompted.
4. Lillemare teaches you all six suppression spells.

## For developers

Dialogue plugin source: [tools/build_esp.mjs](tools/build_esp.mjs). Rebuild with:

```bash
node tools/build_esp.mjs
```

## Changelog

Release notes: [CHANGELOG.md](CHANGELOG.md).

## Requirements

| Requirement | Details |
|-------------|---------|
| **OpenMW** | **0.51.0 or newer** (Lua `LOAD` scripts and `openmw.content` registration). |
| **Morrowind data** | Base **Morrowind** assets installed and configured in OpenMW. |
| **Other mods** | No known incompatibilities. |
| **Original engine** | **Not supported** — OpenMW only. |

## License

This project is licensed under the [MIT License](LICENSE).
