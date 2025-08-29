// Players
let allPlayers
async function getPlayers() {
    const response = await axios.get("../_data/players.json")
    allPlayers = response.data
}

// Find beatmaps
const findPlayers = playerId => allPlayers.find(player => Number(player.playerId) === Number(playerId))

const pillarDominionOptionEl = document.getElementById("pillar_dominion_option")
const pillarCoalescenceOptionEl = document.getElementById("pillar_coalescence_option")
window.selectPillarEl = document.getElementById("select_pillar")

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

const mapButtonContainerEl = document.getElementById("map_button_container")
let totalMaxHp = 0
let leftHpBeforeMap, rightHpBeforeMap
let allBeatmaps
async function getBeatmaps() {
    // Get beatmap and set total max hp
    const response = await axios.get("../_data/beatmaps.json")
    
    // Set Total Max Hp
    switch (response.data.roundName) {
        case "RO64": case "RO32": case "RO16":
            totalMaxHp = 800000
            pillarDominionOptionEl.style.display = "none"
            pillarCoalescenceOptionEl.style.display = "none"
            window.selectPillarEl.setAttribute("size", 2)
            break
        case "QF": case "SF":
            totalMaxHp = 1000000
            pillarCoalescenceOptionEl.style.display = "none"
            window.selectPillarEl.setAttribute("size", 2)
            break
        case "F": case "GF":
            totalMaxHp = 1200000
    }

    // Set sides max HP
    leftHpBeforeMap = totalMaxHp
    rightHpBeforeMap = totalMaxHp

    // Show original scores
    animation.hpNumberLeft.update(leftHpBeforeMap)
    animation.hpNumberRight.update(rightHpBeforeMap)
    hpNegativeNumberLeftEl.style.display = "none"
    hpNegativeNumberRightEl.style.display = "none"

    // Save beatmaps
    allBeatmaps = response.data.beatmaps

    // Create buttons
    for (let i = 0; i < allBeatmaps.length; i++) {
        if (allBeatmaps[i].mod === "PS" || allBeatmaps[i].mod === "TB") continue
        const button = document.createElement("button")
        button.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        button.classList.add("beatmap_button")
        button.addEventListener("click", pillarMapSelection)
        button.dataset.id = allBeatmaps[i].beatmap_id
        mapButtonContainerEl.append(button)
    }
}

getBeatmaps()

// Find beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

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

    hpNegativeNumberLeftEl.style.display = "none"
    hpNegativeNumberRightEl.style.display = "none"

    animation.hpNegativeNumberLeft.update(0)
    animation.hpNegativeNumberRight.update(0)
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

// Health Bars
const hpBarHealthLeftEl = document.getElementById("hp_bar_health_left")
const hpBarHealthRightEl = document.getElementById("hp_bar_health_right")

// IPC State
let ipcState
let checkedWinner = false

// Pillar Map Selection
window.currentPillarMapId = null
function pillarMapSelection() {
    const beatmapButtons = document.getElementsByClassName("beatmap_button")
    for (let i = 0; i < beatmapButtons.length; i++) {
        beatmapButtons[i].style.color = "var(--text-color)"
        beatmapButtons[i].style.backgroundColor = "transparent"
    }
    this.style.color = "var(--sidebar-background)"
    this.style.backgroundColor = "var(--text-color)"
    window.currentPillarMapId = Number(this.dataset.id)
}

// Pillar variables
window.selectPlayerEl = document.getElementById("select_player")
const redNeutralizationEl = document.getElementById("r_n")
const blueNeutralizationEl = document.getElementById("b_n")
const redDominionEl = document.getElementById("r_d")
const blueDominionEl = document.getElementById("b_d")
const redCoalescenceEl = document.getElementById("r_c")
const blueCoalescenceEl = document.getElementById("b_c")

// Lookup map for IDs
const pillarIdMap = {
    r_n: null,
    b_n: null,
    r_d: null,
    b_d: null,
    r_c: null,
    b_c: null,
}

// Lookup map for DOM elements
const pillarElementMap = {
    r_n: redNeutralizationEl,
    b_n: blueNeutralizationEl,
    r_d: redDominionEl,
    b_d: blueDominionEl,
    r_c: redCoalescenceEl,
    b_c: blueCoalescenceEl,
}

function setPillar() {
    if (!window.selectPlayerEl.value || !window.selectPillarEl.value) return

    const key = `${window.selectPlayerEl.value}_${window.selectPillarEl.value}`
    pillarIdMap[key] = window.currentPillarMapId 

    const correctElement = pillarElementMap[key]
    let currentBeatmap = findBeatmaps(window.currentPillarMapId)

    if (correctElement && currentBeatmap) {
        correctElement.textContent = `${currentBeatmap.mod}${currentBeatmap.order}`
    }
}

const BAR_MAX_WIDTH = 284
const MAX_SCORE_DIFF = 350000

const MOD_MULTIPLIERS = {
    HR: 1.1,
    DT: 1.2,
    RESONANCE: 1.3,
}

const PILLAR_MULTIPLIERS = {
    NEUTRALIZE: 0.5,
    DOMINION: 1.5,
    COALESCENCE: 2,
}

function updateHpNumbers(left, right) {
    animation.hpNumberLeft.update(left)
    animation.hpNumberRight.update(right)
}

function updateNegativeNumbers(left, right) {
    animation.hpNegativeNumberLeft.update(left)
    animation.hpNegativeNumberRight.update(right)
}

function setNegativeDisplay(leftVisible, rightVisible) {
    hpNegativeNumberLeftEl.style.display = leftVisible ? "block" : "none"
    hpNegativeNumberRightEl.style.display = rightVisible ? "block" : "none"
}

function updateHpBars(left, right) {
    hpBarHealthLeftEl.style.width = `${(left / totalMaxHp) * BAR_MAX_WIDTH}px`
    hpBarHealthRightEl.style.width = `${(right / totalMaxHp) * BAR_MAX_WIDTH}px`
}

function handleNegative(newLeft, newRight) {
    if (newLeft === 0 && newRight !== 0) {
        setNegativeDisplay(true, false)
        updateNegativeNumbers(newLeft, 0)
    } else if (newRight === 0 && newLeft !== 0) {
        setNegativeDisplay(false, true)
        updateNegativeNumbers(0, newRight)
    } else {
        setNegativeDisplay(false, false)
        updateNegativeNumbers(0, 0)
    }
}

// Helper Functions
function updateHpNumbers(left, right) {
    animation.hpNumberLeft.update(left)
    animation.hpNumberRight.update(right)
}
function updateNegativeNumbers(left, right) {
    animation.hpNegativeNumberLeft.update(left)
    animation.hpNegativeNumberRight.update(right)
}
function setNegativeDisplay(leftVisible, rightVisible) {
    hpNegativeNumberLeftEl.style.display = leftVisible ? "block" : "none"
    hpNegativeNumberRightEl.style.display = rightVisible ? "block" : "none"
}
function updateHpBars(left, right) {
    hpBarHealthLeftEl.style.width = `${(left / totalMaxHp) * BAR_MAX_WIDTH}px`
    hpBarHealthRightEl.style.width = `${(right / totalMaxHp) * BAR_MAX_WIDTH}px`
}

// Player Variables
let redPlayer, bluePlayer, redPlayerId, bluePlayerId

// Socket
const socket = createTosuWsSocket()
// Socket
let currentLeftScore, currentRightScore, currentScoreDifference
// Current beatmap
let currentBeatmapId, currentMappoolBeatmapDetails
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Get Players
    if (redPlayerId !== data.tourney.clients[0].user.id) {
        redPlayerId = data.tourney.clients[0].user.id
        redPlayer = findPlayers(redPlayerId)
    }
    if (bluePlayerId !== data.tourney.clients[1].user.id) {
        bluePlayerId = data.tourney.clients[1].user.id
        bluePlayer = findPlayers(bluePlayerId)
    }

    // Set Beatmap Id
    if (currentBeatmapId !== data.beatmap.id) {
        currentBeatmapId = data.beatmap.id
        currentMappoolBeatmapDetails = findBeatmaps(currentBeatmapId)
    }

    // IPC State
    if (ipcState !== data.tourney.ipcState) {
        ipcState = data.tourney.ipcState

        if (ipcState === 4 && !checkedWinner) {
            checkedWinner = true 
            if (!isWarmupToggled) {
                if (currentLeftScore > currentRightScore) {
                    rightHpBeforeMap -= currentScoreDifference
                    if (rightHpBeforeMap < 0) {
                        // Clamp to 0
                        const overflow = rightHpBeforeMap
                        rightHpBeforeMap = 0

                        // Show negative numbers
                        hpNegativeNumberLeftEl.style.display = "none"
                        hpNegativeNumberRightEl.style.display = "block"
                        animation.hpNegativeNumberLeft.update(0)
                        animation.hpNegativeNumberRight.update(overflow)
                    }
                } else if (currentLeftScore < currentRightScore) {
                    leftHpBeforeMap -= currentScoreDifference
                    if (leftHpBeforeMap < 0) {
                        // Clamp to 0
                        const overflow = leftHpBeforeMap
                        leftHpBeforeMap = 0

                        // Show negative numbers
                        hpNegativeNumberLeftEl.style.display = "block"
                        animation.hpNegativeNumberLeft.update(overflow)
                    }
                }
            }
        } else if (ipcState !== 4) {
            checkedWinner = false
        }
    } 

    if (!isWarmupToggled) {
        if (ipcState === 3) {
            // --- Scores ---
            let leftScore = data.tourney.clients[0].play.score
            let rightScore = data.tourney.clients[1].play.score
            
            // --- Pooler Slot ---
            if (currentMappoolBeatmapDetails?.mod === "PS") {
                if (currentMappoolBeatmapDetails.secondMod === "HR") {
                  leftScore /= MOD_MULTIPLIERS.HR
                  rightScore /= MOD_MULTIPLIERS.HR
                }
                if (currentMappoolBeatmapDetails.secondMod === "DT") {
                  leftScore /= MOD_MULTIPLIERS.DT
                  rightScore /= MOD_MULTIPLIERS.DT
                }
              
                if (
                  redPlayer?.playerResonance === currentMappoolBeatmapDetails.resonance
                ) {
                  leftScore *= MOD_MULTIPLIERS.RESONANCE
                }
                if (
                  bluePlayer?.playerResonance === currentMappoolBeatmapDetails.resonance
                ) {
                  rightScore *= MOD_MULTIPLIERS.RESONANCE
                }
            }
          
            // --- Score Difference ---
            let scoreDiff = Math.abs(leftScore - rightScore)
          
            // Pillar Neutralization
            if (
                (Number(pillarIdMap.r_n) === currentBeatmapId && leftScore < rightScore) ||
                (Number(pillarIdMap.b_n) === currentBeatmapId && rightScore < leftScore)
            ) {
                scoreDiff = Math.round(scoreDiff * PILLAR_MULTIPLIERS.NEUTRALIZE)
            }
          
            // Pillar Dominion
            if (
                (Number(pillarIdMap.r_d) === currentBeatmapId && leftScore > rightScore) ||
                (Number(pillarIdMap.b_d) === currentBeatmapId && rightScore > leftScore)
            ) {
                scoreDiff = Math.round(scoreDiff * PILLAR_MULTIPLIERS.DOMINION)
            }
          
            // Pillar Coalescence
            if (
                Number(pillarIdMap.r_c) === currentBeatmapId ||
                Number(pillarIdMap.b_c) === currentBeatmapId
            ) {
                scoreDiff = Math.round(scoreDiff * PILLAR_MULTIPLIERS.COALESCENCE)
            }
          
            scoreDiff = Math.min(scoreDiff, MAX_SCORE_DIFF)
          
            // --- HP Updates ---
            let leftHp = leftHpBeforeMap
            let rightHp = rightHpBeforeMap
          
            if (leftScore > rightScore) {
                const newRight = Math.max(rightHp - scoreDiff, 0)
                updateHpNumbers(leftHp, newRight)
                updateHpBars(leftHp, newRight)
                handleNegative(leftHp, newRight)
            } else if (rightScore > leftScore) {
                const newLeft = Math.max(leftHp - scoreDiff, 0)
                updateHpNumbers(newLeft, rightHp)
                updateHpBars(newLeft, rightHp)
                handleNegative(newLeft, rightHp)
            } else {
                // Tie
                updateHpNumbers(leftHp, rightHp)
                updateHpBars(leftHp, rightHp)
                handleNegative(leftHp, rightHp)
            }
        } else {
            // Default state
            updateHpNumbers(leftHpBeforeMap, rightHpBeforeMap)
            updateHpBars(leftHpBeforeMap, rightHpBeforeMap)
        }
    }
}