import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"

export default async (interaction, upOrDown) => {

    const { message, user } = interaction
    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | Embed não encontrada.`,
            components: []
        }).catch(() => { })

    const animeName = embed.fields[0]?.value

    if (!animeName)
        return await interaction.update({
            content: `${e.Deny} | Nome do anime não encontrado`,
            embeds: [],
            components: []
        }).catch(() => { })

    return await Database.Indications.findOneAndUpdate(
        { name: animeName },
        {
            $addToSet: {
                [upOrDown]: user.id
            },
            $pullAll: {
                [upOrDown === 'up' ? 'down' : 'up']: [user.id]
            }
        },
        {
            upsert: false,
            new: true
        }
    )
        .then(async anime => {

            const buttons = [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Atualizar',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'anime', src: 'refresh' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Indicar',
                        emoji: e.Animated.SaphireReading,
                        custom_id: JSON.stringify({ c: 'anime', src: 'indicate' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Informações',
                        emoji: '🔎',
                        custom_id: JSON.stringify({ c: 'anime', src: 'info' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: anime?.up?.length || 0,
                        emoji: e.Upvote,
                        custom_id: JSON.stringify({ c: 'anime', src: 'up' }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: anime?.down?.length || 0,
                        emoji: e.DownVote,
                        custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }]

            if (client.admins.includes(interaction?.message?.interaction?.user?.id))
                buttons.push({
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Deletar anime',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'anime', src: 'delete' }),
                            style: ButtonStyle.Danger
                        }
                    ]
                })

            return await interaction.update({ components: buttons }).catch(() => { })
        })
        .catch(async () => {
            return await interaction.reply({
                content: `${e.Deny} | Anime não encontrado no banco de dados ou não foi possível computar seu voto`,
                ephemeral: true
            }).catch(() => { })
        })

}
