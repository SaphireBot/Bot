import allCommands from '../../functions/help/allCommands.js'
import { Colors, PermissionsTranslate } from '../../../../util/Constants.js'

export default {
    name: 'help',
    description: '[bot] Comando de ajuda',
    category: "bot",
    dm_permission: false,
    type: 1,
    helpData: {
        description: 'Meio suspeito pedir ajuda no comando de ajuda... Escolhe um comando pra pegar as informações dele, né?'
    },
    options: [
        {
            name: 'command',
            description: '[bot] Selecione um comando para obter o painel de ajuda dele.',
            type: 3,
            required: true,
            autocomplete: true
        }
    ],
    async execute({ interaction, e, client }) {

        const { options, guild } = interaction
        const commandOption = options.getString('command')
        const command = client.slashCommands.get(commandOption)
        const moeda = await guild.getCoin()

        if (commandOption === 'all') return allCommands(interaction)

        if (!command)
            return await interaction.reply({
                content: `${e.Deny} | Comando não encontrado.`,
                ephemeral: true
            })

        const cmdData = client.slashCommandsData.find(cmd => cmd.name === command.name)
        const commandMention = `</${command.name}:${cmdData?.id}>`
        const helpData = command.helpData

        if (!helpData)
            return await interaction.reply({
                content: `${e.Deny} | Informações do comando não encontrada. | ${commandMention}`,
                ephemeral: true
            })

        if (!helpData.fields) helpData.fields = []
        if (!helpData.permissions) helpData.permissions = []

        if (helpData.permissions?.length > 0)
            helpData.fields.unshift({
                name: 'Permissões',
                value: !helpData.permissions || !helpData.permissions?.length
                    ? 'Nenhuma'
                    : helpData.permissions.map(perm => `\`${PermissionsTranslate[perm] || perm}\``).join(', ').limit('MessageEmbedFieldValue')
            });

        if (helpData.fields.length > 0)
            helpData.fields = helpData.fields.map(data => ({ name: data.name, value: data.value.replace(/MOEDA/g, moeda) }))

        if (helpData.fields.length > 25) helpData.fields.length = 25

        return await interaction.reply({
            content: cmdData ? commandMention : null,
            embeds: [{
                title: helpData.title || `Comando: ${command.name}`,
                color: Colors[helpData.color] || Colors.Blue,
                description: helpData.description.replace(/\$moeda/g, moeda),
                fields: [...helpData.fields],
                footer: helpData.footer || null
            }]
        })
            .catch(async () => await interaction.reply({
                content: `${e.Deny} | Erro ao executar o \`helpData\` do comando \`${command.name || "Nome não encontrado."}\``
            }).catch(() => { })
            )

    }
}