-- UESP built-in spell autocalc formula (Morrowind:Spells):
-- ((Min + Max) * Duration * (BaseCost / 40) + Area * (BaseCost / 40)) * (1.5 if Target)
-- Rounded to nearest whole number.
--
-- Cast chance preview (Morrowind:Spellmakers), fatigue at 50%:
-- (Mysticism*2 + Willpower/5 + Luck/10 - SpellCost - SoundMagnitude)
--   * (0.75 + 0.5 * CurrentFatigue/MaxFatigue)

local function calcBuiltInSpellCost(minMag, maxMag, duration, baseCost, area, isTarget)
    local minM = math.max(minMag, 0)
    local maxM = math.max(maxMag, 0)
    local dur = math.max(duration, 1)
    area = area or 0

    local cost = (minM + maxM) * dur * (baseCost / 40) + area * (baseCost / 40)
    if isTarget then
        cost = cost * 1.5
    end
    return math.floor(cost + 0.5)
end

local function calcCastChance(mysticism, willpower, luck, spellCost, soundMagnitude, fatigueRatio)
    fatigueRatio = fatigueRatio or 0.5
    soundMagnitude = soundMagnitude or 0
    local chance = (mysticism * 2 + willpower / 5 + luck / 10 - spellCost - soundMagnitude)
        * (0.75 + 0.5 * fatigueRatio)
    if chance < 0 then return 0 end
    if chance > 100 then return 100 end
    return math.floor(chance)
end

return {
    calcBuiltInSpellCost = calcBuiltInSpellCost,
    calcCastChance = calcCastChance,
}
