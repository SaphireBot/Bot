import { Routes } from 'discord.js'
import { REST } from "@discordjs/rest"
import { readdirSync } from 'fs'
import { Config as config } from '../../util/Constants.js'
import 'dotenv/config'

export default async (client) => {

    const commands = []
    const adminCommands = [] // Ideia dada por Gorniaky - 395669252121821227
    const folders = readdirSync('./src/structures/commands/slashCommands/')

    for (let dir of folders) {

        const commandsData = readdirSync(`./src/structures/commands/slashCommands/${dir}/`).filter(file => file.endsWith('.js'))

        for await (let file of commandsData) {

            const query = await import(`../commands/slashCommands/${dir}/${file}`)
            const pull = query.default

            if (pull && pull.name) {
                client.slashCommandsData.push({
                    name: pull.name,
                    category: pull.category || "Não possui",
                    description: pull.description || "Não possui"
                });
                client.slashCommands.set(pull.name, pull);
                (pull.admin || pull.staff) ? adminCommands.push(pull) : commands.push(pull);
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

    client.user.setActivity(`${client.slashCommands.size} comandos em ${client.guilds.cache.size} servidores`, { type: 'PLAYING' });
    client.user.setStatus('idle');

    return `${client.slashCommands.size} Slash Commands Loaded`

}