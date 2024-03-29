import { Message, Routes } from "discord.js";
import { Emojis as e } from "../../../util/util.js";
import { registerCommands, adminCommands } from "../../handler/commands.handler.js";
import { SaphireClient as client } from "../../../classes/index.js";
import { socket } from "../../../websocket/websocket.js";

/**
 * @param { Message } message
 */
export default async (message, method, commandName) => {

    if (method == "put") return putAdminCommands()
    if (method == "delete") return deleteAdminCommands()
    if (method == "global") return registerGlobal()
    if (method == "delete_global") return deleteGlobalCommand()
    if (method == "register_global") return registerGlobalCommand()
    if (method == "register_guild") return registerGuildCommand()
    if (method == "delete_guild") return deleteGuildCommand()

    return
    async function registerGlobal() {
        const msg = await message.reply({ content: `${e.Loading} | Registrando comandos globais...` })
        const response = await registerCommands()
        return callback(msg, response)
    }

    async function putAdminCommands() {

        const msg = await message.reply({ content: `${e.Loading} | Registrando comandos administrativos...` })

        client.rest.put(Routes.applicationGuildCommands(client.user.id, message.guildId), { body: adminCommands })
            .then(data => callback(
                msg,
                data?.length
                    ? `${e.CheckV} | ${data?.length || 0} Comandos administrativos foram registrados neste servidor.`
                    : `${e.DenyX} | Nenhum comando foi registrado. Tente novamente.`
            ))
            .catch(err => {
                console.log(err)
                return callback(msg, `${e.DenyX} | Erro ao registrar os comandos administrativos neste servidor. Erro escrito no console.`)
            })

    }

    async function deleteAdminCommands() {

        const msg = await message.reply({ content: `${e.Loading} | Deletando comandos administrativos...` })

        const commands = await client.rest.get(Routes.applicationGuildCommands(client.user.id, message.guildId))
            .then(cmds => cmds.filter(cmd => adminCommands.find(c => c.name == cmd.name)))
            .catch(() => [])

        if (!commands?.length)
            return callback(msg, `${e.Info} | Nenhum comando administrativo está registrado neste servidor.`)

        let result = await Promise.all(commands.map(cmd => client.rest.delete(Routes.applicationGuildCommand(client.user.id, message.guildId, cmd.id)).then(() => true).catch(() => null)))
        result = result.filter(Boolean)

        return callback(
            msg,
            result?.length
                ? `${e.CheckV} | ${result?.length} comandos administrativos foram deletados deste servidor.`
                : `${e.DenyX} | Nenhum comandos administrativo foi deletado deste servidor.`
        )

    }

    /**
     * @param { Message } msg 
     * @param { string } content 
     */
    function callback(msg, content) {
        return msg.edit({ content })
            .catch(() => message.channel.send({ content }).catch(() => { }))
    }

    async function deleteGlobalCommand() {

        const command = client.slashCommands.get(commandName)

        if (!command)
            return message.reply({
                content: `${e.DenyX} | Nenhum comando foi encontrado na Collection principal.`
            })

        const exist = await client.rest.get(Routes.applicationCommand(client.user.id, command.id || "0")).then(data => data?.id ? true : false).catch(() => null)

        if (!exist)
            return message.reply({
                content: `${e.DenyX} | O comando \`${command?.name}\` não está registrado globalmente.`
            })

        if (!command?.id)
            return message.reply({
                content: `${e.DenyX} | O ID do comando não foi definido na Collection principal.`
            })

        const msg = await message.reply({
            content: `${e.Loading} | Localizando e deletando comando global...`
        })

        return await client.rest.delete(Routes.applicationCommand(client.user.id, command.id))
            .then(() => callback(msg, `${e.CheckV} | O comando \`${command.name}\` foi deletado globalmente.`))
            .catch(err => {
                console.log(err)
                return callback(msg, `${e.bug} | Não foi possível deletar o comando global. Mais informações no console.`)
            })

    }

    async function registerGlobalCommand() {

        const command = client.slashCommands.get(commandName)

        if (!command)
            return message.reply({
                content: `${e.DenyX} | Nenhum comando foi encontrado na Collection principal.`
            })

        const msg = await message.reply({
            content: `${e.Loading} | Registrando comando global...`
        })

        delete command.id
        return await client.rest
            .post(
                Routes.applicationCommands(client.user.id),
                {
                    headers: { "Content-Type": "application/json" },
                    body: command
                }
            )
            .then(data => {
                socket?.send({ type: "ApplicationCommandData", applicationCommandData: [data] })
                return callback(msg, `${e.CheckV} | O comando \`${command.name}\` foi registrado globalmente com sucesso.`)
            })
            .catch(err => {
                console.log(err)
                return callback(msg, `${e.DenyX} | Não foi possível registar o comando ${command.name} globalmente. Os dados do erro foram logados no console.`)
            })

    }

    async function registerGuildCommand() {

        if (!commandName || !client.slashCommands.get(commandName))
            return message.reply({ content: `${e.DenyX} | Nenhum comando foi encontrado para registro.` })

        const msg = await message.reply({ content: `${e.Loading} | Registrando o comando \`/${commandName}\` neste servidor.` })

        const commandData = client.slashCommands.get(commandName)
        delete commandData.id
        client.rest.put(Routes.applicationGuildCommands(client.user.id, message.guild.id), { body: [commandData] })
            .then(data => callback(
                msg,
                data?.length
                    ? `${e.CheckV} | O comando \`/${commandName}\` foi adicionado neste servidor.`
                    : `${e.DenyX} | O comando \`/${commandName}\` não foi registrado. Tente novamente.`
            ))
            .catch(err => {
                console.log(err)
                return callback(msg, `${e.DenyX} | Erro ao registrar o comando \`/${commandName}\` neste servidor. Erro escrito no console.`)
            })

    }

    async function deleteGuildCommand() {

        if (!client.slashCommands.get(commandName))
            return message.reply({ content: `${e.DenyX} | Nenhum comando foi encontrado na collection principal.` })

        const msg = await message.reply({ content: `${e.Loading} | Deletando o comando \`/${commandName}\` neste servidor...` })

        const command = await client.rest.get(Routes.applicationGuildCommands(client.user.id, message.guildId))
            .then(cmds => cmds.find(cmd => cmd.name == commandName))
            .catch(() => undefined)

        if (!command?.id)
            return callback(msg, `${e.Info} | O comando \`/${commandName}\` foi encontrado neste servidor.`)

        return client.rest.delete(Routes.applicationGuildCommand(client.user.id, message.guild.id, command.id))
            .then(() => callback(msg, `${e.CheckV} | O comando \`/${commandName}\` foi deletado deste servidor.`))
            .catch(err => {
                console.log(err)
                return callback(msg, `${e.DenyX} | Erro ao deletar o comando \`/${commandName}\` neste servidor. Erro escrito no console.`)
            })

    }
}