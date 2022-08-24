import allCommands from '../../functions/help/allCommands.js'
import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'help',
    description: '[bot] Comando de ajuda',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'command',
            description: '[bot] Selecione um comando para obter o painel de ajuda dele.',
            type: 3,
            required: true,
            autocomplete: true
        }
    ],
    async execute({ interaction, emojis: e, client }) {

        const { options } = interaction
        const commandOption = options.getString('command')
        const command = client.slashCommands.get(commandOption)

        if (commandOption === 'all') return allCommands(interaction)

        if (!command)
            return await interaction.reply({
                content: `${e.Deny} | Comando não encontrado.`,
                ephemeral: true
            })

        if (!command.helpData)
            return await interaction.reply({
                content: `${e.Deny} | Informações do comando não encontrada.`,
                ephemeral: true
            })

        return await interaction.reply({ embeds: command.helpData })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | Erro ao executar o \`helpData\` do comando \`${command.name || "Nome não encontrado."}\``
                })
            })

    },
    helpData: [{
        color: Colors.Blue,
        title: 'Help Command',
        description: 'teste'
    }]
}