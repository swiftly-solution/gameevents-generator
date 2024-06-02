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

const GameEvents = []

for (const gameEvent of eventsContentSplitted) {
    const gameEventName = gameEvent[0]
    const gameEventData = gameEvent[1]

    const commentRegex = /comment={"(.*)"}/g.exec(gameEventData)
    const comment = `This event is triggered when ${commentRegex ? commentRegex[1] : `${gameEventName} is triggered`}`
    const structure = /structure={(.*)}/g.exec(gameEventData)

    const eventFields = JSON.parse(structure[1])
    const processedEventName = `On${gameEventName.split("_").map((a) => (a.charAt(0).toUpperCase() + a.slice(1))).join("")}`;
    if (eventFields.local) continue;

    const fields = [];
    for (const field of Object.keys(eventFields)) {
        if (eventFields[field].value == "string") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetString("${field}")));`)
        } else if (eventFields[field].value == "short") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetInt("${field}")));`)
        } else if (eventFields[field].value == "long") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetInt("${field}")));`)
        } else if (eventFields[field].value == "bool") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetBool("${field}")));`)
        } else if (eventFields[field].value == "uint64") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetUint64("${field}")));`)
        } else if (eventFields[field].value == "playercontroller") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetPlayerSlot("${field}").Get()));`)
        } else if (eventFields[field].value == "player_pawn") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetPlayerSlot("${field}").Get()));`)
        } else if (eventFields[field].value == "byte") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetInt("${field}")));`)
        } else if (eventFields[field].value == "float") {
            fields.push(`    eventData.push_back(msgpack::object(pEvent->GetFloat("${field}")));`)
        }
    }

    GameEvents.push(`GAME_EVENT(${gameEventName})
{
    std::stringstream ss;
    std::vector<msgpack::object> eventData;

${fields.join("\n")}

    msgpack::pack(ss, eventData);

    PluginEvent *event = new PluginEvent("core", pEvent, nullptr);
    g_pluginManager->ExecuteEvent("core", "${processedEventName}", ss.str(), event);
    delete event;
}`)
}

writeFileSync("output/gameevents.cpp", readFileSync("data/template.cpp").toString().replace(/\[\[generated\]\]/g, GameEvents.join("\n\n")));