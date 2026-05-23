local core = require('openmw.core')
local selfApi = require('openmw.self')
local ui = require('openmw.ui')
local config = require('scripts.supression_spells.config')
local suppressLogic = require('scripts.supression_spells.suppress_logic')

local suppressState = suppressLogic.createState()

local function showMessages(messages)
    for _, msg in ipairs(messages) do
        ui.showMessage(msg)
    end
end

return {
    engineHandlers = {
        onUpdate = function(dt)
            local messages
            suppressState, messages = suppressLogic.tick(selfApi, dt, suppressState, 'You')
            showMessages(messages)
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

    eventHandlers = {
        SupressionSpellsTeachFromDialogue = function()
            core.sendGlobalEvent(config.teachSpellsEvent, {
                player = selfApi.object,
            })
        end,

        SupressionSpellsShowMessage = function(data)
            if data and data.message then
                ui.showMessage(data.message)
            end
        end,
    },
}
