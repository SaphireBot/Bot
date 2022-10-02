import translate from '@iamtraction/google-translate'
import { Languages } from '../../../../util/Constants.js'

export default {
    name: 'Translate Message',
    helpData: {
        color: 'Blue',
        description: 'Clique na mensagem e traduza ela para a língua padrão do seu Discord.',
        permissions: [],
        fields: [{
            name: 'Linguagens suportadas',
            value: 'Quase todas. Vou detectar a língua da mensagem automáticamente, traduzir para Português e te mostrar o resultado.'.limit('MessageEmbedFieldValue')
        }]
    },
    type: 3,
    async execute({ interaction, e, client }) {

        const { targetMessage, locale } = interaction
        const text = targetMessage.content?.slice(0, 1000)
        const formatedLocale = locale.split('-')[0]

        if (!text)
            return await interaction.reply({
                content: `${e.Deny} | Não há nenhum texto para traduzir nesta mensagem.`,
                ephemeral: true
            })

        const Embed = {
            color: 0x4295FB,
            author: { name: 'Google Tradutor', iconURL: 'https://media.discordapp.net/attachments/893361065084198954/1002389116329144440/unknown.png?width=484&height=484' },
            fields: [{
                name: 'Texto',
                value: `\`\`\`txt\n${text}\n\`\`\``
            }]
        }

        await interaction.deferReply({})

        return translate(text, { to: formatedLocale })
            .then(async res => {

                Embed.fields[1] = {
                    name: 'Tradução',
                    value: `\`\`\`txt\n${res.text}\n\`\`\``
                }

                Embed.footer = { text: `Traduzido de ${Languages[res.from.language.iso]} para ${Languages[formatedLocale]}` }

                return await interaction.editReply({ embeds: [Embed] }).catch(() => { })

            }).catch(async err => {

                Embed.color = client.red
                Embed.fields[1] = {
                    name: 'Erro',
                    value: `\`\`\`txt\n${err}\n\`\`\``
                }

                return await interaction.editReply({ embeds: [Embed] }).catch(() => { })
            })
    }
}