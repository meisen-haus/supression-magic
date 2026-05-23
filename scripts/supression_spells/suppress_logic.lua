local core = require('openmw.core')
local types = require('openmw.types')
local config = require('scripts.supression_spells.config')

local TICK_INTERVAL = 0.25

local SUPPRESS_EFFECT_IDS = {
    [config.suppressMagickaEffectId] = true,
    [config.suppressEnchantEffectId] = true,
}

local SUPPRESS_SPELL_IDS = {}
for _, spell in ipairs(config.spells) do
    SUPPRESS_SPELL_IDS[spell.id] = true
end

local function makeKey(effectId, extra)
    if extra then return effectId .. '|' .. extra end
    return effectId
end

local function getEffectName(ae, effectId, extra)
    local ok, eff = pcall(function()
        if extra then return ae:getEffect(effectId, extra) end
        return ae:getEffect(effectId)
    end)
    if ok and eff and eff.name then return eff.name end
    return effectId
end

local function createState()
    return { timer = 0, applied = {}, wasSm = false, wasSe = false }
end

local function tick(selfApi, dt, state, targetName)
    state.timer = state.timer + dt
    if state.timer < TICK_INTERVAL then return state, {} end
    state.timer = 0

    local actor = selfApi.object or selfApi
    local ae = types.Actor.activeEffects(actor)
    local as = types.Actor.activeSpells(actor)

    local smEff = ae:getEffect(config.suppressMagickaEffectId)
    local seEff = ae:getEffect(config.suppressEnchantEffectId)
    local smMag = smEff and smEff.magnitude or 0
    local seMag = seEff and seEff.magnitude or 0

    local smPct = smMag / 100
    local sePct = seMag / 100

    local desired = {}
    local spellNames = {}
    local equipNames = {}

    if smMag > 0 or seMag > 0 then
        for _, activeSpell in pairs(as) do
            local spellId = activeSpell.id or '?'
            if not SUPPRESS_SPELL_IDS[spellId] and (activeSpell.temporary or activeSpell.fromEquipment) then
                local isEquip = activeSpell.fromEquipment
                for _, eff in pairs(activeSpell.effects) do
                    local effId = eff.id or eff.effectId or '?'
                    if not SUPPRESS_EFFECT_IDS[effId] then
                        local extra = nil
                        if eff.affectedAttribute and eff.affectedAttribute ~= '' then
                            extra = eff.affectedAttribute
                        elseif eff.affectedSkill and eff.affectedSkill ~= '' then
                            extra = eff.affectedSkill
                        end

                        local key = makeKey(effId, extra)
                        local mag = eff.magnitudeThisFrame or eff.magnitude or 0
                        if mag > 0 then
                            local pct = isEquip and sePct or smPct
                            if pct > 0 then
                                local reduction = mag * pct
                                if not desired[key] then
                                    desired[key] = { effectId = effId, extra = extra, amount = reduction }
                                    local name = getEffectName(ae, effId, extra)
                                    if isEquip then
                                        equipNames[name] = true
                                    else
                                        spellNames[name] = true
                                    end
                                else
                                    desired[key].amount = desired[key].amount + reduction
                                end
                            end
                        end
                    end
                end
            end
        end
    end

    local mods = {}

    for key, prev in pairs(state.applied) do
        if not desired[key] then
            mods[#mods + 1] = { effectId = prev.effectId, extra = prev.extra, amount = prev.amount }
        end
    end

    for key, d in pairs(desired) do
        local prev = state.applied[key]
        local alreadyApplied = prev and prev.amount or 0
        local delta = d.amount - alreadyApplied
        if delta > 0.01 or delta < -0.01 then
            mods[#mods + 1] = { effectId = d.effectId, extra = d.extra, amount = -delta }
        end
    end

    state.applied = desired

    if #mods > 0 then
        core.sendGlobalEvent('SupressionSpellsModifyEffects', {
            actor = actor,
            mods = mods,
        })
    end

    local messages = {}
    local smActive = smMag > 0
    local seActive = seMag > 0

    local verb = (targetName == 'You') and ' are ' or ' is '
    local verbNeg = (targetName == 'You') and ' are ' or ' is '

    if smActive and not state.wasSm then
        local names = {}
        for n in pairs(spellNames) do names[#names + 1] = n end
        if #names > 0 then
            messages[#messages + 1] = targetName .. verb .. 'affected by Suppress Magicka. '
                .. 'Spell effects reduced by ' .. math.floor(smMag) .. '%: '
                .. table.concat(names, ', ')
        else
            messages[#messages + 1] = targetName .. verb .. 'affected by Suppress Magicka ('
                .. math.floor(smMag) .. '%)'
        end
    elseif not smActive and state.wasSm then
        messages[#messages + 1] = targetName .. verbNeg .. 'no longer affected by Suppress Magicka.'
    end

    if seActive and not state.wasSe then
        local names = {}
        for n in pairs(equipNames) do names[#names + 1] = n end
        if #names > 0 then
            messages[#messages + 1] = targetName .. verb .. 'affected by Suppress Enchantment. '
                .. 'Enchantment effects reduced by ' .. math.floor(seMag) .. '%: '
                .. table.concat(names, ', ')
        else
            messages[#messages + 1] = targetName .. verb .. 'affected by Suppress Enchantment ('
                .. math.floor(seMag) .. '%)'
        end
    elseif not seActive and state.wasSe then
        messages[#messages + 1] = targetName .. verbNeg .. 'no longer affected by Suppress Enchantment.'
    end

    state.wasSm = smActive
    state.wasSe = seActive

    return state, messages
end

local function exportState(state)
    return { applied = state.applied, wasSm = state.wasSm, wasSe = state.wasSe }
end

local function importState(data)
    local state = createState()
    if data then
        if data.applied then state.applied = data.applied end
        if data.wasSm then state.wasSm = data.wasSm end
        if data.wasSe then state.wasSe = data.wasSe end
    end
    return state
end

return {
    createState = createState,
    tick = tick,
    exportState = exportState,
    importState = importState,
}
