return {
    storageSection = 'supression_spells',

    -- NPC
    npcRecordId = 'lm_lillemare',
    npcName = 'Lillemare',
    npcRace = 'high elf',
    npcClass = 'sorcerer',
    npcCell = 'Tel Vos, Central Tower',

    -- Quest
    questJournalId = 'lm_quest',
    questFirstMeetStage = 10,
    questCompleteStage = 100,
    requiredItemId = 'ingred_hackle-lo_leaf_01',
    requiredItemCount = 5,

    -- Custom magic effects
    suppressMagickaEffectId = 'supression_spells_suppress_magicka',
    suppressMagickaEffectName = 'Suppress Magicka',
    suppressEnchantEffectId = 'supression_spells_suppress_enchantment',
    suppressEnchantEffectName = 'Suppress Enchantment',

    -- VFS path for both custom magic effect icons (.png required for OpenMW lookup)
    effectIcon = 'icons/s/suppression_magic.png',

    -- Spell definitions: { id, name, effectId, range }
    -- Range constants are resolved at registration time from content.RANGE.
    spells = {
        {
            id = 'lm_sup_magicka_self',
            name = 'Suppress Magicka (Self)',
            effect = 'suppressMagicka',
            range = 'Self',
        },
        {
            id = 'lm_sup_magicka_touch',
            name = 'Suppress Magicka (Touch)',
            effect = 'suppressMagicka',
            range = 'Touch',
        },
        {
            id = 'lm_sup_magicka_target',
            name = 'Suppress Magicka (Target)',
            effect = 'suppressMagicka',
            range = 'Target',
        },
        {
            id = 'lm_sup_enchant_self',
            name = 'Suppress Enchantment (Self)',
            effect = 'suppressEnchant',
            range = 'Self',
        },
        {
            id = 'lm_sup_enchant_touch',
            name = 'Suppress Enchantment (Touch)',
            effect = 'suppressEnchant',
            range = 'Touch',
        },
        {
            id = 'lm_sup_enchant_target',
            name = 'Suppress Enchantment (Target)',
            effect = 'suppressEnchant',
            range = 'Target',
        },
    },

    -- Spell tuning defaults (applied to all six spells).
    -- Magnitude = percentage reduction; duration in seconds.
    spellMagnitudeMin = 0,
    spellMagnitudeMax = 20,
    spellDuration = 10,

    -- Magicka cost uses the same base cost as Resist Magicka (UESP: 2) and the
    -- built-in vendor-spell formula from Morrowind:Spells / Morrowind:Spellmakers.
    -- Self/Touch: 10 mp | Target: 15 mp (with current magnitude and duration).
    -- Reference: Great Resist Magicka = 30 pts / 10 sec / 30 mp; Magickguard = 20–40 / 10 sec / 30 mp.
    spellEffectBaseCost = 2,
    spellEffectArea = 0,

    -- Event names for cross-script communication
    teachSpellsEvent = 'SupressionSpellsTeachSpells',
}
