import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'invite',
    name_localizations: { "en-US": "invite", 'pt-BR': 'convite' },
    description: '[bot] Um link rápido para me colocar no seu servidor',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    helpData: {
        description: 'Você pode me convidar usando esse comando. Legal, né? Tipo me convidar [clicando aqui](https://discord.com/oauth2/authorize?client_id=912509487984812043&scope=bot%20applications.commands&permissions=2146958847)'
    },
    options: [],
    apiData: {
        name: "invite",
        description: "Receba um convite direto para me adicionar no seu servidor.",
        category: "Saphire",
        synonyms: ["convite"],
        perms: {
            user: [],
            bot: []
        }
    },
    execute({ interaction, client }) {
        return interaction.reply({
            embeds: [{
                color: Colors.Green,
                description: `Você pode me adicionar [clicando aqui](https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=2146958847).`
            }]
        })
    }
}