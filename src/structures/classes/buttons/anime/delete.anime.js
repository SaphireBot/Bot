import {
    SaphireClient as client,
    Database,
} from "../../../../classes/index.js"
import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { message, user } = interaction

    if (!client.admins.includes(user.id)) return

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
            content: `${e.Deny} | Nome do anime não localizado.`,
            components: []
        }).catch(() => { })

    return Database.Indications.findOneAndDelete({ name: animeName })
        .then(async anime => {

            if (!anime)
                return await interaction.update({
                    content: `${e.Deny} | Este anime não se encontra no banco de dados.`,
                    embeds: [],
                    components: [
                        {
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
                                    emoji: e.saphireLendo,
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
                                    style: ButtonStyle.Success,
                                    disabled: true
                                },
                                {
                                    type: 2,
                                    label: anime?.down?.length || 0,
                                    emoji: e.DownVote,
                                    custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                                    style: ButtonStyle.Danger,
                                    disabled: true
                                }
                            ]
                        },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    label: 'Deletar anime',
                                    emoji: e.Trash,
                                    custom_id: JSON.stringify({ c: 'anime', src: 'delete' }),
                                    style: ButtonStyle.Danger,
                                    disabled: true
                                }
                            ]
                        }
                    ]
                }).catch(() => { })

            embed.color = client.red
            embed.fields[0].value = `~~${embed.fields[0].value}~~`

            return await interaction.update({
                embeds: [embed],
                components: [
                    {
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
                                emoji: e.saphireLendo,
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
                                style: ButtonStyle.Success,
                                disabled: true
                            },
                            {
                                type: 2,
                                label: anime?.down?.length || 0,
                                emoji: e.DownVote,
                                custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                                style: ButtonStyle.Danger,
                                disabled: true
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Deletar anime',
                                emoji: e.Trash,
                                custom_id: JSON.stringify({ c: 'anime', src: 'delete' }),
                                style: ButtonStyle.Danger,
                                disabled: true
                            }
                        ]
                    }
                ]
            })
        })
        .catch(async () => {
            return await interaction.update({
                content: `${e.Deny} | Não foi possível deletar este anime.`,
                embeds: [],
                components: [
                    {
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
                                emoji: e.saphireLendo,
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
                                style: ButtonStyle.Success,
                                disabled: true
                            },
                            {
                                type: 2,
                                label: anime?.down?.length || 0,
                                emoji: e.DownVote,
                                custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                                style: ButtonStyle.Danger,
                                disabled: true
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Deletar anime',
                                emoji: e.Trash,
                                custom_id: JSON.stringify({ c: 'anime', src: 'delete' }),
                                style: ButtonStyle.Danger,
                                disabled: true
                            }
                        ]
                    }
                ]
            }).catch(() => { })
        })

}