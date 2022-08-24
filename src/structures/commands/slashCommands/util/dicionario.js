import dicio from 'dicionario.js'
import { Colors, PermissionsTranslate } from '../../../../util/Constants.js'

export default {
    name: 'dicionario',
    description: '[util] Pesquise por significados de palavras',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'palavra',
            description: 'Palavra que você busca pelo significado',
            required: true,
            type: 3,
            min_length: 1,
            max_length: 46
        }
    ],
    async execute({ interaction, client, emojis: e }) {

        const { options, guild, channel } = interaction

        if (!guild.clientHasPermission('ManageWebhooks'))
            return await interaction.reply({
                content: `${e.Info} | Eu preciso da permissão **\`GERENCIAR WEBHOOK\`** para executar este comando.`
            })

        const query = options.getString('palavra')
        const embed = { color: client.blue, title: `🔍 Palavra Pesquisada: ${query.toLowerCase().captalize()}`.limit('MessageEmbedTitle'), fields: [] }
        await interaction.deferReply()

        return await dicio.significado(query?.toLowerCase())
            .then(result => buildEmbed(result))
            .catch(async () => await interaction.editReply({ content: `${e.Deny} | Nenhum significado foi encontrado.` }))

        async function respondQuery() {

            return channel.createWebhook({
                name: `Dicionário ${client.user.username}`,
                avatar: 'https://media.discordapp.net/attachments/893361065084198954/1003453447124811796/unknown.png'
            })
                .then(webHook => sendMessageWebHook(webHook))
                .catch(async err => {
                    return await interaction.editReply({
                        content: `${e.Warn} | Houve um erro ao criar a WebHook.\n> \`${err}\``
                    }).catch(() => { })
                })

            async function sendMessageWebHook(webHook) {

                return webHook.send({ embeds: [embed] })
                    .then(async () => {
                        webHook.delete().catch(() => { })
                        return await interaction.deleteReply().catch(() => { })
                    })
                    .catch(async err => {
                        webHook.delete().catch(() => { })
                        return await interaction.editReply({
                            content: `${e.Warn} | Erro ao enviar a mensagem.\n> \`${err}\``
                        }).catch(() => { })
                    })

            }
        }

        function buildEmbed(result) {

            embed.fields.push({
                name: `${e.Info} Classe`,
                value: result.class.captalize().limit('MessageEmbedFieldValue')
            })

            if (result.etymology)
                embed.fields.push({
                    name: `${e.Commands} Etimologia`,
                    value: result.etymology.limit('MessageEmbedFieldValue')
                })

            result.meanings.map((res, i) =>
                embed.fields.push({
                    name: `${e.saphireLendo} Significado ${i + 1}`,
                    value: '> ' + res
                        ?.replace(/\[|\]/g, '`')
                        ?.limit('MessageEmbedFieldValue')
                        || 'Resultado indefinido'
                }))

            if (embed.fields.length > 25) embed.fields.length = 25

            return respondQuery()
        }

    },
    helpData: [{
        color: Colors.Blue,
        title: 'Comando dicioanário',
        description: 'Pesquise pelos significados das palavras usando este comando.',
        fields: [
            {
                name: 'Palavra',
                value: 'Escreva a palavra que você deseja pegar o significado neste campo. Exemplo: `/dicionario palavra:árvore`'
            },
            {
                name: 'Permissões necessárias',
                value: PermissionsTranslate['ManageWebhooks']
            }
        ]
    }]
}