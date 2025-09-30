const textarea = document.getElementById("textarea")
const teams = []
function submit() {
    const textareaValue = textarea.value
    const textareaValueSplit = textareaValue.split("\n")
    for (let i = 0; i < textareaValueSplit.length; i++) {
        const textareaValueSplitIndividual = textareaValueSplit[i].split("\t")
        const teamData = {
            playerId: Number(textareaValueSplitIndividual[0]),
            playerResonance: textareaValueSplitIndividual[1]
        }
        teams.push(teamData)
    }

    const jsonString = JSON.stringify(teams, null, 4)
    const blob = new Blob([jsonString], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "players.json"
    link.click()
}