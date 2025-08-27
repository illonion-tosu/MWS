// Set Total Max HP
const hpNumberLeftEl = document.getElementById("hp_number_left")
const hpNumberRightEl = document.getElementById("hp_number_right")
const hpNegativeNumberLeftEl = document.getElementById("hp_negative_number_left")
const hpNegativeNumberRightEl = document.getElementById("hp_negative_number_right")

// Animation
const animation = {
    "hpNumberLeft": new CountUp(hpNumberLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "hpNumberRight": new CountUp(hpNumberRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "hpNegativeNumberLeft": new CountUp(hpNegativeNumberLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ")", prefix: "(" }),
    "hpNegativeNumberRight": new CountUp(hpNegativeNumberRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ")", prefix: "(" })
}

let totalMaxHp = 0
let leftHpBeforeMap, rightHpBeforeMap
let allBeatmaps
async function getBeatmaps() {
    // Get beatmap and set total max hp
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps
    switch (response.data.roundName) {
        case "RO64": case "RO32": case "RO16":
            totalMaxHp = 800000
            break
        case "QF": case "SF":
            totalMaxHp = 1000000
            break
        case "F": case "GF":
            totalMaxHp = 1200000
    }

    // Set sides max HP
    leftHpBeforeMap = totalMaxHp
    rightHpBeforeMap = totalMaxHp

    animation.hpNumberLeft.update(leftHpBeforeMap)
    animation.hpNumberRight.update(rightHpBeforeMap)
    hpNegativeNumberLeftEl.style.display = "none"
    hpNegativeNumberRightEl.style.display = "none"
}

getBeatmaps()

// Set HP
const setHpValueLeftEl = document.getElementById("set_hp_value_left")
const setHpValueRightEl = document.getElementById("set_hp_value_right")
function setHp() {
    function getHpValue(inputEl, original) {
        if (inputEl.value === "") return original
        return Math.max(Math.min(Number(inputEl.value), totalMaxHp), 1)
    }

    leftHpBeforeMap = getHpValue(setHpValueLeftEl, leftHpBeforeMap)
    rightHpBeforeMap = getHpValue(setHpValueRightEl, rightHpBeforeMap)
}

// Warmup
const toggleWarmupEl = document.getElementById("toggle_warmup")
let isWarmupToggled = false
function toggleWarmup() {
    isWarmupToggled = !isWarmupToggled
    toggleWarmupEl.textContent = `Toggle Warmup: ${isWarmupToggled? "ON" : "OFF"}`
    toggleWarmupEl.classList.add(isWarmupToggled? "on" : "off")
    toggleWarmupEl.classList.remove(isWarmupToggled? "off" : "on")
}