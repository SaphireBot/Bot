import { Routes } from 'discord.js'
import { REST } from "@discordjs/rest"
import { readdirSync } from 'fs'
import { Config as config } from '../../util/Constants.js'
import { SaphireClient } from '../../classes/index.js'
import 'dotenv/config'

/**
 * @param { SaphireClient } client
 */
export default async (client) => {

    const commands = []
    const adminCommands = [] // Ideia dada por Gorniaky - 395669252121821227
    const folders = readdirSync('./src/structures/commands/slashCommands/')

    for (let dir of folders) {

        const commandsData = readdirSync(`./src/structures/commands/slashCommands/${dir}/`).filter(file => file.endsWith('.js'))

        for await (let file of commandsData) {

            const query = await import(`../commands/slashCommands/${dir}/${file}`)
            const cmd = query.default

            if (cmd && cmd.name) {
                client.commandsUsed[cmd.name] = 0
                client.slashCommandsData.push({
                    name: cmd.name,
                    category: cmd.category || "Não possui",
                    description: cmd.description || "Não possui"
                });
                client.slashCommands.set(cmd.name, cmd);
                (cmd.admin || cmd.staff) ? adminCommands.push(cmd) : commands.push(cmd);
                continue
            }
        }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN)

    const guildsId = config.guildsToPrivateCommands || []

    for (let guild of guildsId)
        if (client.guilds.cache.has(guild))
            rest.put(Routes.applicationGuildCommands(client.user.id, guild), { body: adminCommands })

    await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
    );

    return `${client.slashCommands.size} Slash Commands Loaded`
}