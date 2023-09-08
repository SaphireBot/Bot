import { ApplicationCommandOptionType } from 'discord.js'
import { Emojis as e } from '../../../../util/util.js'
import { Languages } from '../../../../util/Constants.js'
import translate from '@iamtraction/google-translate'

export default {
    name: 'translate',
    name_localizations: { 'pt-BR': 'traduzir' },
    description: '[util] Traduza textos rapidamente',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'to',
            name_localizations: { 'pt-BR': 'para' },
            type: ApplicationCommandOptionType.String,
            description: 'Para qual lingua devo traduzir o texto?',
            autocomplete: true,
            required: true
        },
        {
            name: 'text',
            name_localizations: { 'pt-BR': 'texto' },
            type: ApplicationCommandOptionType.String,
            description: 'Texto que devo traduzir (Max: 1013)',
            max_length: 1013,
            required: true
        }
    ],
    apiData: {
        name: "translate",
        description: "Traduza textos rapidamente dentro do seu servidor",
        category: "Utilidades",
        synonyms: ["traduzir"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options } = interaction
        const to = options.getString('to')
        if (!Languages[to])
            return interaction.reply({
                content: `${e.Deny} | O idioma informado não é um idioma válido.`,
                ephemeral: true
            })

        const text = options.getString('text')
        const Embed = {
            color: 0x4295FB,
            author: { name: 'Google Tradutor', iconURL: 'https://media.discordapp.net/attachments/893361065084198954/1002389116329144440/unknown.png?width=484&height=484' },
            fields: [{
                name: 'Texto',
                value: `\`\`\`txt\n${text}\n\`\`\``
            }]
        }

        await interaction.reply({ content: `${e.Loading} | Traduzindo...` })

        return translate(text, { to })
            .then(res => {

                if (res.text.length > 1013)
                    res.text = `${res.text.slice(0, 1010)}...`

                Embed.fields[1] = {
                    name: 'Tradução',
                    value: `\`\`\`txt\n${res.text}\n\`\`\``
                }

                Embed.footer = { text: `Traduzido de ${Languages[res.from.language.iso] || 'WTF?'} para ${Languages[to]}` }

                return interaction.editReply({ content: null, embeds: [Embed] }).catch(() => { })
            })
            .catch(err => {
                return interaction.editReply({ content: `${e.Animated.SaphirePanic} | Haaa, deu ruim.\n${e.bug} | \`${err}\``.limit('MessageContent'), embeds: [] }).catch(() => { })
            })
    }
}