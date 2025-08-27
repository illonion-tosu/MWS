// Set Total Max HP
const hpNumberLeftEl = document.getElementById("hp_number_left")
const hpNumberRightEl = document.getElementById("hp_number_right")
let totalMaxHp = 0
let leftHpBeforeMap, rightHpBeforeMap
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("_data/beatmaps.json")
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

    hpNumberLeftEl.textContent = leftHpBeforeMap.toLocaleString()
    hpNumberRightEl.textContent = rightHpBeforeMap.toLocaleString()
}

getBeatmaps()