import { Colors } from '../../../../util/Constants.js'

export default {
    name: 'invite',
    description: '[bot] Um link rápido para me colocar no seu servidor',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction, emojis: e }) {
        return await interaction.reply({
            embeds: [{
                color: Colors.Green,
                description: `${e.Link} | Você pode me adicionar [cliando aqui](https://discord.com/oauth2/authorize?client_id=912509487984812043&scope=bot%20applications.commands&permissions=2146958847).`
            }]
        })
    }
}