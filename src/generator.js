const { readFileSync, mkdirSync, writeFileSync } = require("fs");

const gameEventsContent = readFileSync("tmp/game-events.mdx").toString()
let eventsContentSplitted = gameEventsContent.split("###")
eventsContentSplitted.shift()

for (let i = 0; i < eventsContentSplitted.length; i++) {
    eventsContentSplitted[i] = eventsContentSplitted[i].split("\n").filter((a) => a.length > 0)
    for (let j = 0; j < eventsContentSplitted[i].length; j++)
        eventsContentSplitted[i][j] = eventsContentSplitted[i][j].trim()
}

mkdirSync("output", { recursive: true })

const GameEvents = ["std::map<std::string, std::string> gameEventsRegister = {"]
const ignoreGameEvents = ["player_connect", "player_disconnect", "player_chat", "demo_stop"]

let i = 0;
for (const gameEvent of eventsContentSplitted) {
    const gameEventName = gameEvent[0]
    const gameEventData = gameEvent[1]
    if (ignoreGameEvents.includes(gameEventName)) continue;

    const commentRegex = /comment={"(.*)"}/g.exec(gameEventData)
    const comment = `This event is triggered when ${commentRegex ? commentRegex[1] : `${gameEventName} is triggered`}`
    const structure = /structure={(.*)}/g.exec(gameEventData)

    const eventFields = JSON.parse(structure[1])
    const processedEventName = `On${gameEventName.split("_").map((a) => (a.charAt(0).toUpperCase() + a.slice(1))).join("")}`;
    if (eventFields.local) continue;

    GameEvents.push(`    { "${gameEventName}", "${processedEventName}" },`)
}
GameEvents.push("};")

writeFileSync("output/GGameEvents.h", readFileSync("data/template.h").toString().replace(/\[\[generated\]\]/g, GameEvents.join("\n")));