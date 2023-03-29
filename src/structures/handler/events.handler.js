import { readdirSync } from 'fs'
const eventsFilesNames = readdirSync('./src/structures/events/').filter(fileName => fileName.endsWith('.js'))
for (const eventFileName of eventsFilesNames)
    import(`../events/${eventFileName}`)

console.log(`${eventsFilesNames.length} events readed`)