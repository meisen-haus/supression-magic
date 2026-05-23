local storage = require('openmw.storage')
local config = require('scripts.supression_spells.config')

local SAVE_VERSION = 1

local section

local function getSection()
    if not section then
        section = storage.globalSection(config.storageSection)
    end
    return section
end

local function isQuestComplete()
    local s = getSection()
    return s:get('questComplete') == true
end

local function markQuestComplete()
    if isQuestComplete() then
        return false
    end
    local s = getSection()
    s:set('questComplete', true)
    return true
end

local function clearAll()
    local s = getSection()
    s:set('questComplete', nil)
    s:set('saveVersion', nil)
end

local function exportForSave()
    return {
        saveVersion = SAVE_VERSION,
        questComplete = isQuestComplete(),
    }
end

local function importFromSave(data)
    if type(data) ~= 'table' then
        return
    end
    local s = getSection()
    s:set('saveVersion', data.saveVersion or SAVE_VERSION)
    if data.questComplete then
        s:set('questComplete', true)
    end
end

return {
    isQuestComplete = isQuestComplete,
    markQuestComplete = markQuestComplete,
    clearAll = clearAll,
    exportForSave = exportForSave,
    importFromSave = importFromSave,
}
