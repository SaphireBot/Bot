import { PermissionsTranslate, Config as config } from '../../util/Constants.js';
import { SaphireClient as client } from '../../classes/index.js';
import { readdirSync } from 'fs';
import { Emojis as e } from '../../util/util.js';
import { Routes } from 'discord.js';
import { socket } from '../../websocket/websocket.js';
import 'dotenv/config';
export const commands = [];
export const adminCommands = []; // Ideia dada por Gorniaky - 395669252121821227
export const commandsApi = [];
const tags = { '1': 'slash', '2': 'apps', '3': 'apps', '4': 'bug', '5': 'admin', '6': 'prefix' }

export default async () => {

    // Prefix
    const prefixFolders = readdirSync('./src/structures/commands/prefix/')
    const blockCommands = client.clientData?.ComandosBloqueadosSlash || []

    for await (const dir of prefixFolders) {

        const prefixCommands = readdirSync(`./src/structures/commands/prefix/${dir}/`).filter(file => file.endsWith('.js'))

        for await (const file of prefixCommands) {

            if (typeof file !== 'string') continue

            const query = await import(`../commands/prefix/${dir}/${file}`)
            const cmd = query.default

            if (typeof cmd?.name !== 'string' || typeof cmd?.execute !== 'function') continue

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
                cmd.api_data.tags.push(tags[`${cmd.type}`])
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

    for await (const cmd of [commands, adminCommands].flat()) {
        if (!cmd?.api_data) continue

        if (cmd?.api_data?.perms?.user?.length) cmd.api_data.perms.user = cmd?.api_data.perms.user.map(perm => PermissionsTranslate[perm] || perm)
        if (cmd?.api_data?.perms?.bot?.length) cmd.api_data.perms.bot = cmd?.api_data.perms.bot.map(perm => PermissionsTranslate[perm] || perm)

        if (cmd.admin || cmd.staff) cmd.api_data.tags.push(tags['5'])
        const prefixCommand = client.prefixCommands.get(cmd.name)
        if (prefixCommand) {

            if (prefixCommand?.api_data?.tags?.length)
                cmd.api_data.tags.push(...prefixCommand?.api_data?.tags)

            if (
                !cmd.api_data.tags.includes(tags['2'])
                && !cmd.api_data.tags.includes(tags['1'])
            )
                cmd.api_data.tags.push(tags['6'])
            cmd.api_data.aliases = prefixCommand.aliases
        }

        if (blockCommands?.find(Cmd => Cmd.cmd === cmd.name))
            cmd.api_data.tags.push(tags['4'])

        commandsApi.push(cmd?.api_data)
        delete cmd.api_data
    }

    for await (const cmd of client.prefixCommands.toJSON()) {
        const command = Object.assign({}, cmd)
        delete command.execute

        if (!commandsApi.some(c => c.name == cmd.name))
            commandsApi.push(
                Object.assign(command, {
                    tags: Array.isArray(cmd.api_data?.tags) ? cmd.api_data?.tags.concat(tags['6']) : [tags['6']]
                })
            )
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