# Suppression Spells — Gameplay Reference

Mod documentation for players. Describes how the six suppression spells behave. Lillemare’s dialogue is unchanged; this file is not used in-game.

## Overview

The mod adds **Suppress Magicka** and **Suppress Enchantment**, each in **Self**, **Touch**, and **Target** (six spells total).

| Spell line | Reduces |
|------------|---------|
| Suppress Magicka | Magnitude of **cast spells** with duration (Shield, Chameleon, Fortify, etc.) |
| Suppress Enchantment | Magnitude of **equipped item** enchantments (rings, helms, weapons) |

**Self / Touch / Target** only determine who receives the suppression effect, not which magic types are affected.

Default tuning: **0–20%** reduction (rolled per cast), **10 s** duration, **Mysticism** school.

| Range | Magicka cost |
|-------|-------------|
| Self / Touch | 10 |
| Target | 15 |

Costs use the same formula and base cost (2) as vanilla [Resist Magicka](https://en.uesp.net/wiki/Morrowind:Resist_Magicka) vendor spells. Cast success depends on Mysticism skill and the spell's magicka cost.

## Suppress Magicka

**Affected:** Temporary spells cast on the target (not from equipment).

**Not affected:**

- Equipment enchantments → use Suppress Enchantment
- Racial traits, birthsign abilities, and other permanent non-equipment effects
- Bound weapons, summons, and most travel/utility magic (see [Edge cases](#edge-cases))

## Suppress Enchantment

**Affected:** Enchantments on items the target is wearing.

**Not affected:**

- Cast spells → use Suppress Magicka
- Racial traits and birthsign abilities

## Quick reference

| Source | Suppress Magicka | Suppress Enchantment |
|--------|:----------------:|:--------------------:|
| Cast Shield | Yes | — |
| Cast Chameleon / Fortify | Yes | — |
| Ring, helm, or weapon enchant | — | Yes |
| Racial weakness / resist | No | No |
| Bound Dagger | No | No |
| Summoned creature | No | No |

## Reduction

Eligible effects are reduced by:

`effect magnitude × (suppression % ÷ 100)`

Example: Shield 5 pts under 41% Suppress Magicka → effective magnitude ~3 pts.

When suppression expires, reductions are removed.

## UI note

The Magic menu may still display the spell’s original listed strength (e.g. “Shield 5 pts”) while suppression is active. The underlying active effect magnitude is still reduced.

## Edge cases

The mod reduces **numeric magnitudes** on ongoing effects. It does not end spells, remove bound items, or dismiss summons.

| Category | Typical result |
|----------|----------------|
| Magnitude-based cast spells (Shield, Fortify, Chameleon, Levitate, …) | Reduced by Suppress Magicka |
| Equipment enchantments (Sound on helm, Fortify on ring, …) | Reduced by Suppress Enchantment |
| Bound weapons, summons, Water Walking, Recall, Mark | Usually unaffected |

Bound and summon effects are cast as temporary spells but are mostly on/off; they rarely expose a magnitude worth reducing.

## Runtime feedback

Separate from Lillemare’s dialogue, the mod can show brief on-screen messages when suppression starts or ends on a target (listing affected effect names when applicable). This is script feedback only, not NPC text.
