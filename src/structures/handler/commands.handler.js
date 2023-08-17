import { PermissionsTranslate, Config as config } from '../../util/Constants.js';
import { SaphireClient as client } from '../../classes/index.js';
import { readdirSync } from 'fs';
import { Routes } from 'discord.js';
import 'dotenv/config';
import { socket } from '../../websocket/websocket.js';
export const commandsApi = []

export default async () => {

    const commands = []
    const adminCommands = [] // Ideia dada por Gorniaky - 395669252121821227
    const folders = readdirSync('./src/structures/commands/slashCommands/')

    for (const dir of folders) {

        const commandsData = readdirSync(`./src/structures/commands/slashCommands/${dir}/`).filter(file => file.endsWith('.js'))

        for await (const file of commandsData) {

            const query = await import(`../commands/slashCommands/${dir}/${file}`)
            const cmd = query.default

            if (cmd?.name) {
                client.commandsUsed[cmd.name] = 0
                client.slashCommandsData.push({
                    name: cmd.name,
                    category: cmd.category || "Não possui",
                    description: cmd.description || "Não possui"
                });
                client.slashCommands.set(cmd.name, cmd);
                (cmd.admin || cmd.staff) ? adminCommands.push(cmd) : commands.push(cmd);
            }
            continue
        }
        continue
    }

    for (const guild of config.guildsToPrivateCommands || [])
        if (client.guilds.cache.has(guild))
            client.rest.put(Routes.applicationGuildCommands(client.user.id, guild), { body: adminCommands })

    if (client.shardId !== 0) return

    for (const cmd of [...commands, ...adminCommands]) {
        if (!cmd?.apiData) continue

        if (cmd?.apiData?.perms?.user?.length) cmd.apiData.perms.user = cmd?.apiData.perms.user.map(perm => PermissionsTranslate[perm] || perm)
        if (cmd?.apiData?.perms?.bot?.length) cmd.apiData.perms.bot = cmd?.apiData.perms.bot.map(perm => PermissionsTranslate[perm] || perm)

        commandsApi.push(cmd?.apiData)
        delete cmd.apiData
    }

    return await client.rest.put(Routes.applicationCommands(client.user.id), { body: commands })
        .then(() => {
            console.log(`${client.slashCommands.size} Slash Commands Loaded`)
            const interval = setInterval(() => {
                if (socket?.connected) {
                    socket?.send({ type: "apiCommandsData", commandsApi })
                    clearInterval(interval)
                }
            }, 1000 * 5)
        })
        .catch(err => console.log('Command Register Failed', err))
}