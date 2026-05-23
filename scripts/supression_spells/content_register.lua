local content = require('openmw.content')
local config = require('scripts.supression_spells.config')
local spellCost = require('scripts.supression_spells.spell_cost')

local resistTemplate = content.magicEffects.records['resistmagicka']
if not resistTemplate then
    error('[supression_spells] no magic effect template: resistmagicka')
end

local EFFECT_MAP = {
    suppressMagicka = {
        id = config.suppressMagickaEffectId,
        name = config.suppressMagickaEffectName,
    },
    suppressEnchant = {
        id = config.suppressEnchantEffectId,
        name = config.suppressEnchantEffectName,
    },
}

for _, def in pairs(EFFECT_MAP) do
    content.magicEffects.records[def.id] = {
        template = resistTemplate,
        name = def.name,
        harmful = false,
        icon = config.effectIcon,
        school = 'mysticism',
        baseCost = config.spellEffectBaseCost,
    }
end

local RANGE_MAP = {
    Self = content.RANGE.Self,
    Touch = content.RANGE.Touch,
    Target = content.RANGE.Target,
}

local function magickaCostForRange(rangeName)
    return spellCost.calcBuiltInSpellCost(
        config.spellMagnitudeMin,
        config.spellMagnitudeMax,
        config.spellDuration,
        config.spellEffectBaseCost,
        config.spellEffectArea,
        rangeName == 'Target'
    )
end

for _, spell in ipairs(config.spells) do
    local effectDef = EFFECT_MAP[spell.effect]
    if not effectDef then
        error('[supression_spells] unknown effect key: ' .. tostring(spell.effect))
    end

    content.spells.records[spell.id] = {
        name = spell.name,
        type = content.spells.TYPE.Spell,
        cost = magickaCostForRange(spell.range),
        isAutocalc = false,
        effects = {
            {
                id = effectDef.id,
                range = RANGE_MAP[spell.range],
                duration = config.spellDuration,
                magnitudeMin = config.spellMagnitudeMin,
                magnitudeMax = config.spellMagnitudeMax,
                area = config.spellEffectArea,
            },
        },
    }
end
