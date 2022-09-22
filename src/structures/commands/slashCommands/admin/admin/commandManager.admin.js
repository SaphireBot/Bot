import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const commandToOpen = options.getString('blocked_commands')
    const commandToBlock = options.getString('command')
    let responseMessage = ''

    /**
     * cmd: Command name
     * error: Error reason
     */
    const data = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueadosSlash')
    const bugs = data?.ComandosBloqueadosSlash || []

    await openCommand()
    await blockCommand()

    if (!responseMessage)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum comando foi dado.`,
            ephemeral: true
        })

    return await interaction.reply({ content: responseMessage })

    async function openCommand() {

        if (!commandToOpen) return

        if (!bugs || !bugs.length)
            return responseMessage += `\n${e.Deny} | Nenhum comando está bloqueado`

        if (commandToOpen === 'all') return await openAll()

        const commandBlocked = bugs.find(cmd => cmd.cmd === commandToOpen)

        if (!commandBlocked)
            return responseMessage += `\n${e.Deny} | Comando não encontrado.`

        return Database.Client.updateOne(
            { id: client.user.id },
            {
                $pull: {
                    ComandosBloqueadosSlash: { cmd: commandToOpen }
                }
            }
        )
            .then(() => responseMessage += `\n${e.Check} | O comando \`${commandToOpen}\` foi liberado com sucesso.`)
            .catch(() => responseMessage += `\n${e.Warn} | Não foi possível liberar o comando \`${commandToOpen}\`.`)

        async function openAll() {

            return Database.Client.updateOne(
                { id: client.user.id },
                {
                    $unset: {
                        ComandosBloqueadosSlash: 1
                    }
                }
            )
                .then(() => responseMessage += `\n${e.Check} | Todos os ${bugs.length} comandos foram liberados.`)
                .catch(() => responseMessage += `\n${e.Warn} | Não foi possível liberar todos os comandos.`)
        }
    }

    async function blockCommand() {

        if (!commandToBlock) return

        const commandBlocked = bugs.find(cmd => cmd.cmd === commandToBlock)

        if (commandBlocked)
            return responseMessage += `\n${e.Deny} | Este comando já está bloqueado.`

        return Database.Client.updateOne(
            { id: client.user.id },
            {
                $push: {
                    ComandosBloqueadosSlash: {
                        cmd: commandToBlock,
                        error: 'Comando bloqueado pela equipe administrativa'
                    }
                }
            }
        )
            .then(() => responseMessage += `\n${e.Check} | O comando \`${commandToBlock}\` foi bloqueado com sucesso.`)
            .catch(() => responseMessage += `\n${e.Warn} | Não foi possível bloquear o comando \`${commandToBlock}\`.`)
    }

}