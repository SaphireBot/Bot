import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 */
export default async interaction => {

    return await interaction.reply({
        content: `${e.saphireOlhadinha} | Que ousadia... Você acha mesmo que pode ganhar de mim?`,
        fetchReply: true,
        embeds: [{
            color: client.blue,
            title: '✌️ Jokempo',
            description: `${e.CheckV} ${client.user} já escolheu\n${e.Loading} ${interaction.user} ainda não escolheu`
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: e.pedra,
                        custom_id: JSON.stringify({ c: 'jkp', play: 'stone', type: 'bot' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.tesoura,
                        custom_id: JSON.stringify({ c: 'jkp', play: 'scissors', type: 'bot' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.papel,
                        custom_id: JSON.stringify({ c: 'jkp', play: 'paper', type: 'bot' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }
        ]
    })
        .then(async message => await Database.Cache.Jokempo.set(message.id, {
            players: [interaction.user.id, client.user.id],
            type: 'bot'
        }))
        .catch(err => {
            return interaction.channel.send({
                content: `${e.DenyX} | Não foi possível inicializar o jogo.\n${e.bug} | \`${err}\``
            })
        })

}