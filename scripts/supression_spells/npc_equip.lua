local core = require('openmw.core')
local selfApi = require('openmw.self')
local types = require('openmw.types')
local config = require('scripts.supression_spells.config')
local suppressLogic = require('scripts.supression_spells.suppress_logic')

local SLOT = types.Actor.EQUIPMENT_SLOT

local EQUIPMENT = {
    [SLOT.Helmet]       = 'lm_timetravellers_guide',
    [SLOT.Boots]        = 'heavy_leather_boots',
    [SLOT.Cuirass]      = 'dreugh_cuirass',
    [SLOT.Pants]        = 'extravagant_pants_01',
    [SLOT.Skirt]        = 'templar skirt obj',
    [SLOT.Shirt]        = 'common_shirt_01',
    [SLOT.LeftGauntlet]  = 'BM_Nordic02_gloveL',
    [SLOT.RightGauntlet] = 'BM_Nordic02_gloveR',
    [SLOT.CarriedLeft]   = 'lm_foresight',
}

local equipDone = false
local suppressState = suppressLogic.createState()
local npcName = nil

local function setupLillemare()
    if equipDone then return end
    equipDone = true
    if selfApi.object.recordId ~= config.npcRecordId then return end

    types.Actor.setEquipment(selfApi, EQUIPMENT)

    local spellList = types.Actor.spells(selfApi)
    for _, spell in ipairs(config.spells) do
        pcall(function() spellList:add(spell.id) end)
    end

    local ok, rec = pcall(function() return types.NPC.record(selfApi) end)
    if ok and rec then npcName = rec.name end
end

return {
    engineHandlers = {
        onUpdate = function(dt)
            setupLillemare()
            local name = npcName or 'Target'
            local messages
            suppressState, messages = suppressLogic.tick(selfApi, dt, suppressState, name)
            for _, msg in ipairs(messages) do
                core.sendGlobalEvent('SupressionSpellsRelayMessage', { message = msg })
            end
        end,

        onSave = function()
            return { suppress = suppressLogic.exportState(suppressState) }
        end,

        onLoad = function(data)
            if data and data.suppress then
                suppressState = suppressLogic.importState(data.suppress)
            end
        end,
    },
}
