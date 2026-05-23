# Suppression Spell Rules (Developer)

Technical reference for mod authors. Player-facing summary: [SUPPRESSION_RULES.md](SUPPRESSION_RULES.md).

Implementation: `scripts/supression_spells/suppress_logic.lua`

## Classification

Effects are filtered by source, not by effect ID:

| Channel | Reduced by | Filter |
|---------|------------|--------|
| Spell effects | Suppress Magicka | `temporary` and not `fromEquipment` |
| Enchantment effects | Suppress Enchantment | `fromEquipment` |

Excluded: six suppression spells, suppress marker effects, permanent non-equipment abilities.

Only effects with `magnitude > 0` are processed.

## Reduction

```
reduction = effect_magnitude × (suppress_magnitude ÷ 100)
```

Deltas are tracked in `state.applied`; restores on expiry. Modifications run in `global.lua` via `ActorActiveEffects:modify()` (local scripts cannot modify other actors).

## UI

Magic menu shows spell-defined magnitude, not post-modify `ActiveEffect.magnitude`.

## Status messages

Generated on transition into/out of suppress magicka/enchantment in `suppress_logic.tick()`. NPC messages relayed via `SupressionSpellsRelayMessage` → player `SupressionSpellsShowMessage`.

## Files

| File | Role |
|------|------|
| `suppress_logic.lua` | Detection, deltas, messages |
| `player.lua` | Player tick, `ui.showMessage` |
| `npc_equip.lua` | NPC tick, message relay |
| `global.lua` | `modify()`, relay handler |
| `content_register.lua` | Effect/spell registration |
| `spell_cost.lua` | UESP magicka cost / cast-chance helpers |
| `config.lua` | IDs, tuning defaults |

## Magicka cost and cast chance

Registered in `content_register.lua` using the **built-in vendor spell formula** from [Morrowind:Spells](https://en.uesp.net/wiki/Morrowind:Spells) (same as [Morrowind:Spellmakers](https://en.uesp.net/wiki/Morrowind:Spellmakers) references):

```
((Min + Max) × Duration × (BaseCost / 40) + Area × (BaseCost / 40)) × (1.5 if Target)
```

Rounded to the nearest whole number. Touch and Self use the same multiplier (only Target is ×1.5).

| Parameter | Value | Notes |
|-----------|-------|-------|
| Base cost | 2 | Same as [Resist Magicka](https://en.uesp.net/wiki/Morrowind:Spell_Effects) |
| Magnitude | 0–20 | Percent suppression rolled per cast |
| Duration | 10 s | |
| Area | 0 | Matches vanilla resist vendor spells |

| Range | Magicka cost |
|-------|-------------|
| Self | 10 |
| Touch | 10 |
| Target | 15 |

Vanilla comparison (same base cost 2): *Resist Magicka* 10/5 s = 5 mp; *Great Resist Magicka* 30/10 s = 30 mp; *Magickguard* 20–40/10 s = 30 mp.

Cast chance is not a separate spell field — it follows the Mysticism skill check from [Morrowind:Spellmakers](https://en.uesp.net/wiki/Morrowind:Spellmakers):

```
(Mysticism×2 + Willpower/5 + Luck/10 − SpellCost − SoundMagnitude)
  × (0.75 + 0.5 × CurrentFatigue/MaxFatigue)
```

The spellmaker UI assumes 50% fatigue; full fatigue adds ~25% to the result. Example at 50% fatigue, no Sound: Mysticism 30 → ~50% on a 10 mp Self spell; Mysticism 45 → ~74%; Mysticism 60 → ~94%.

Tune `spellMagnitudeMin`, `spellMagnitudeMax`, `spellDuration`, or `spellEffectBaseCost` in `config.lua`; costs recalculate on next game load.

## Filter (simplified)

```lua
not SUPPRESS_SPELL_IDS[spellId]
and (activeSpell.temporary or activeSpell.fromEquipment)

pct = activeSpell.fromEquipment and sePct or smPct
```

## Icon assets

Custom magic effects use `config.effectIcon` (must include the **`.png` extension** — OpenMW looks for `.dds` first, then falls back to the path as given).

| File | Size | Use |
|------|------|-----|
| `icons/s/suppression_magic.png` | 32×32 | Active effect HUD, tooltips |
| `icons/s/b_suppression_magic.png` | 256×256 | Magic menu (large spell icon) |

After updating the source art, regenerate icons (defaults to `supression_magic.png` in the mod root):

```powershell
.\tools\resize_icons.ps1
```

Or pass an explicit path:

```powershell
.\tools\resize_icons.ps1 -Source "C:\meisen-haus\supression-spells\supression_magic.png"
```

Restart OpenMW so LOAD scripts re-register effects.

## Lua console check

```lua
e = require('openmw.types').Actor.activeEffects(self):getEffect('shield')
print('mag=' .. e.magnitude .. ' base=' .. e.magnitudeBase .. ' mod=' .. e.magnitudeModifier)
```
