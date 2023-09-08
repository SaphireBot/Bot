import { PermissionsTranslate, Config as config } from '../../util/Constants.js';
import { SaphireClient as client } from '../../classes/index.js';
import { readdirSync } from 'fs';
import { Emojis as e } from '../../util/util.js';
import { Routes } from 'discord.js';
import { socket } from '../../websocket/websocket.js';
import 'dotenv/config';
export const commands = []
export const adminCommands = [] // Ideia dada por Gorniaky - 395669252121821227
export const commandsApi = []

export default async () => {

    // Prefix
    const prefixFolders = readdirSync('./src/structures/commands/prefix/')

    for await (const dir of prefixFolders) {

        const prefixCommands = readdirSync(`./src/structures/commands/prefix/${dir}/`).filter(file => file.endsWith('.js'))

        for await (const file of prefixCommands) {

            if (typeof file !== 'string') continue

            const query = await import(`../commands/prefix/${dir}/${file}`)
            const cmd = query.default

            if (!cmd?.name || !cmd?.execute) continue

            if (cmd.name) {
                client.commandsUsed[cmd.name] = 0
                client.prefixCommands.set(cmd.name, cmd)
            }

            if (cmd.aliases?.length)
                for (const alias of cmd.aliases)
                    client.prefixAliasesCommands.set(alias, cmd)

            continue
        }
        continue
    }

    // Slash Commands
    const folders = readdirSync('./src/structures/commands/slash/')
    const applicationCommand = await socket?.timeout(2000).emitWithAck("getApplicationCommands", "get").catch(() => [])

    for await (const dir of folders) {

        const commandsData = readdirSync(`./src/structures/commands/slash/${dir}/`).filter(file => file.endsWith('.js'))

        for await (const file of commandsData) {

            if (typeof file !== 'string') continue
            const query = await import(`../commands/slash/${dir}/${file}`)
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

    for await (const cmd of [...commands, ...adminCommands]) {
        if (!cmd?.apiData) continue

        if (cmd?.apiData?.perms?.user?.length) cmd.apiData.perms.user = cmd?.apiData.perms.user.map(perm => PermissionsTranslate[perm] || perm)
        if (cmd?.apiData?.perms?.bot?.length) cmd.apiData.perms.bot = cmd?.apiData.perms.bot.map(perm => PermissionsTranslate[perm] || perm)

        cmd.apiData.tags = ["slash"]
        if (client.prefixCommands.has(cmd.name))
            cmd.apiData.tags.push("prefix")

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

    for await (const guildId of config.guildsToPrivateCommands || [])
        await client.rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: adminCommands })
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