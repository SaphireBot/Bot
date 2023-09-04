import { PermissionsTranslate, Config as config } from '../../util/Constants.js';
import { SaphireClient as client } from '../../classes/index.js';
import { readdirSync } from 'fs';
import { Routes } from 'discord.js';
import 'dotenv/config';
import { socket } from '../../websocket/websocket.js';
import { Emojis as e } from '../../util/util.js';
export const commands = []
export const adminCommands = [] // Ideia dada por Gorniaky - 395669252121821227
export const commandsApi = []

export default async () => {

    const folders = readdirSync('./src/structures/commands/slashCommands/')
    const applicationCommand = await socket?.timeout(2000).emitWithAck("getApplicationCommands", "get").catch(() => [])

    for (const dir of folders) {

        const commandsData = readdirSync(`./src/structures/commands/slashCommands/${dir}/`).filter(file => file.endsWith('.js'))

        for await (const file of commandsData) {

            const query = await import(`../commands/slashCommands/${dir}/${file}`)
            const cmd = query.default
            const applicationCommandData = applicationCommand?.find(c => c?.name == cmd?.name)

            if (cmd?.name) {
                client.commandsUsed[cmd.name] = 0
                client.slashCommandsData.push({
                    name: cmd.name,
                    category: cmd.category || "Não possui",
                    description: cmd.description || "Não possui"
                });
                (cmd.admin || cmd.staff) ? adminCommands.push(cmd) : commands.push(cmd);
                if (applicationCommandData) cmd.id = applicationCommandData?.id
                client.slashCommands.set(cmd.name, cmd);
            }
            continue
        }
        continue
    }

    for (const cmd of [...commands, ...adminCommands]) {
        if (!cmd?.apiData) continue

        if (cmd?.apiData?.perms?.user?.length) cmd.apiData.perms.user = cmd?.apiData.perms.user.map(perm => PermissionsTranslate[perm] || perm)
        if (cmd?.apiData?.perms?.bot?.length) cmd.apiData.perms.bot = cmd?.apiData.perms.bot.map(perm => PermissionsTranslate[perm] || perm)

        commandsApi.push(cmd?.apiData)
        delete cmd.apiData
    }

    if (client.shardId == 0) {
        const interval = setInterval(() => {
            if (socket?.connected) {
                socket?.send({ type: "apiCommandsData", commandsApi })
                clearInterval(interval)
            }
        }, 1000 * 5)
    }

    return
}

export async function registerCommands() {

    for (const guildId of config.guildsToPrivateCommands || [])
        client.rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: adminCommands })
            .catch(() => { })

    return await client.rest.put(
        Routes.applicationCommands(client.user.id), {
        body: commands
            .map(cmd => {
                delete cmd.id
                return cmd
            })
    })
        .then(data => {
            for (const cmd of data) {
                const cmdData = client.slashCommands.get(cmd.name)
                cmdData.id = cmd.id
                client.slashCommands.set(cmd.name, cmdData)
            }

            return `${e.CheckV} | ${client.slashCommands.size} Slash Commands Globais foram registrados.`
        })
        .catch(err => {
            console.log(err)
            return `${e.DenyX} | Erro ao registrar os Slash Commands Globais. Erro escrito no console.`
        })
}