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

// Your ID variables
let redNeutralizationId
let blueNeutralizationId
let redDominionId
let blueDominionId
let redCoalescenceId
let blueCoalescenceId

// Lookup map for IDs
const pillarIdMap = {
    r_n: () => redNeutralizationId,
    b_n: () => blueNeutralizationId,
    r_d: () => redDominionId,
    b_d: () => blueDominionId,
    r_c: () => redCoalescenceId,
    b_c: () => blueCoalescenceId,
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

    console.log(correctElement, currentBeatmap, window.currentPillarMapId)

    if (correctElement && currentBeatmap) {
        correctElement.textContent = `${currentBeatmap.mod}${currentBeatmap.order}`
    }
}

// Socket
const socket = createTosuWsSocket()
// Socket
let currentLeftScore, currentRightScore, currentScoreDifference
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // IPC State
    if (ipcState !== data.tourney.ipcState) {
        ipcState = data.tourney.ipcState

        if (ipcState === 4 && !checkedWinner) {
            checkedWinner = true 
            if (!isWarmupToggled) {
                if (currentLeftScore > currentRightScore) {
                    rightHpBeforeMap -= currentScoreDifference
                } else if (currentLeftScore < currentRightScore) {
                    leftHpBeforeMap -= currentScoreDifference
                }
            }
        } else if (ipcState !== 4) {
            checkedWinner = false
        }
    } 

    if (!isWarmupToggled) {
        if (ipcState === 3) {
            // Set current scores
            currentLeftScore = data.tourney.clients[0].play.score
            currentRightScore = data.tourney.clients[1].play.score
            currentScoreDifference = Math.min(Math.abs(currentLeftScore - currentRightScore), 350000)

            // Make the animations and stuff
            if (currentLeftScore > currentRightScore) {
                // Set number
                animation.hpNumberLeft.update(leftHpBeforeMap)
                const currentScore = rightHpBeforeMap - currentScoreDifference
                const otherNumber = Math.max(currentScore, 0)
                animation.hpNumberRight.update(otherNumber)

                if (currentScore === 0) {
                    // Display negative numbers
                    hpNegativeNumberLeftEl.style.display = "none"
                    hpNegativeNumberRightEl.style.display = "block"

                    // Animate negative numbers
                    animation.hpNegativeNumberLeft.update(0)
                    animation.hpNegativeNumberRight.update(currentScore)
                }

                // Set bar width
                hpBarHealthLeftEl.style.width = `${leftHpBeforeMap / totalMaxHp * 284}px`
                hpBarHealthRightEl.style.width = `${otherNumber / totalMaxHp * 284}px`
            } else if (currentLeftScore === currentRightScore) {
                // Set number
                animation.hpNumberLeft.update(leftHpBeforeMap)
                animation.hpNumberRight.update(rightHpBeforeMap)

                // Display negative numbers
                hpNegativeNumberLeftEl.style.display = "none"
                hpNegativeNumberRightEl.style.display = "none"

                // Animate negative numbers
                animation.hpNegativeNumberLeft.update(0)
                animation.hpNegativeNumberRight.update(0)

                // Set bar width
                hpBarHealthLeftEl.style.width = `${leftHpBeforeMap / totalMaxHp * 284}px`
                hpBarHealthRightEl.style.width = `${rightHpBeforeMap / totalMaxHp * 284}px`
            } else if (currentLeftScore < currentRightScore) {
                // Set number
                const currentScore = leftHpBeforeMap - currentScoreDifference
                const otherNumber = Math.max(currentScore, 0)
                animation.hpNumberLeft.update(Math.max(currentScore, 0))
                animation.hpNumberRight.update(rightHpBeforeMap)

                if (currentScore === 0) {
                    // Display negative numbers
                    hpNegativeNumberLeftEl.style.display = "block"
                    hpNegativeNumberRightEl.style.display = "none"

                    // Animate negative numbers
                    animation.hpNegativeNumberLeft.update(currentScore)
                    animation.hpNegativeNumberRight.update(0)
                }

                // Set bar width
                hpBarHealthLeftEl.style.width = `${otherNumber / totalMaxHp * 284}px`
                hpBarHealthRightEl.style.width = `${rightHpBeforeMap / totalMaxHp * 284}px`
            }
        } else {
            // Set number
            animation.hpNumberLeft.update(leftHpBeforeMap)
            animation.hpNumberRight.update(rightHpBeforeMap)

            // Set bar width
            hpBarHealthLeftEl.style.width = `${leftHpBeforeMap / totalMaxHp * 284}px`
            hpBarHealthRightEl.style.width = `${rightHpBeforeMap / totalMaxHp * 284}px`
        }
    }
}