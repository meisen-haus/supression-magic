local world = require('openmw.world')
local types = require('openmw.types')
local config = require('scripts.supression_spells.config')
local storageApi = require('scripts.supression_spells.storage')

local function teachSpells(player)
    if not player or not player:isValid() then
        return
    end
    local spells = types.Actor.spells(player)
    for _, spell in ipairs(config.spells) do
        pcall(function()
            spells:add(spell.id)
        end)
    end
end

local function applyModify(ae, amount, effectId, extra)
    if extra then
        ae:modify(amount, effectId, extra)
    else
        ae:modify(amount, effectId)
    end
end

return {
    engineHandlers = {
        onNewGame = function()
            storageApi.clearAll()
        end,

        onSave = function()
            return storageApi.exportForSave()
        end,

        onLoad = function(savedData)
            storageApi.importFromSave(savedData)
        end,
    },

    eventHandlers = {
        [config.teachSpellsEvent] = function(data)
            local player = data and data.player
            if not player then
                for _, p in ipairs(world.players) do
                    teachSpells(p)
                end
            else
                teachSpells(player)
            end
            storageApi.markQuestComplete()
        end,

        SupressionSpellsRelayMessage = function(data)
            if data and data.message then
                for _, p in ipairs(world.players) do
                    p:sendEvent('SupressionSpellsShowMessage', { message = data.message })
                end
            end
        end,

        SupressionSpellsModifyEffects = function(data)
            local actor = data and data.actor
            if not actor or not actor:isValid() then return end
            local ae = types.Actor.activeEffects(actor)
            for _, m in ipairs(data.mods or {}) do
                pcall(function() applyModify(ae, m.amount, m.effectId, m.extra) end)
            end
        end,
    },
}
