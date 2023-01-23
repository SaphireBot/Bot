import { AttachmentBuilder, ButtonStyle, WebhookClient } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
const webhook = new WebhookClient({ url: `${process.env.WEBHOOK_ANIME_SUPPORTER}` })

export default async (interaction, commandData) => {

    const { user, message } = interaction
    if (!client.staff.includes(user.id) && user.id !== '516048524388073516')
        return await interaction.reply({
            content: `${e.Deny} | Você não é um membro autorizado para aceitar/deletar solicitações de animes.`,
            ephemeral: true
        })

    if (commandData.src === 'edit') return edit()
    return commandData.src === 'accept' ? accept() : decline()

    async function edit() {

        const embed = message?.embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | A embed com os dados não foi encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        const name = embed?.fields[1]?.value
        const anime = embed?.fields[2]?.value
        const type = embed?.fields[3]?.value

        return await interaction.showModal(Modals.editAnimeRequest(name, anime, type))
    }

    async function accept() {

        const embed = message?.embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | A embed com os dados não foi encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        const id = embed.fields[0].value
        const name = embed?.fields[1]?.value

        if (client.animes.find(an => an?.id === id)
            || client.animes.find(an => an?.name?.toLowerCase() === name.toLowerCase())
            || client.animes.filter(an => an?.type === 'anime').find(an => an?.name?.toLowerCase() === name.toLowerCase())
        ) {
            removeIndication(id)
            embed.color = client.red
            embed.footer = { text: 'Anime já registrado' }
            return await interaction.update({ embeds: [embed] }).catch(() => { })
        }

        const anime = embed?.fields[2]?.value
        const type = embed?.fields[3]?.value
        const sendedFor = commandData.sendedFor
        let imageUrl = embed?.image?.url

        if (!id || !name || !anime || !type || !imageUrl || !sendedFor)
            return await interaction.update({
                content: `${e.Deny} | Os dados de validação não estão completos`,
                embeds: [], components: []
            }).catch(() => { })

        const attachment = new AttachmentBuilder(imageUrl, { name: `${id}.${imageUrl.split('.').pop()}`, description: 'Saphire Anime Quiz' })

        const messageSavedUrl = await webhook.send({
            embeds: [{
                color: client.blue,
                title: '📝 Anime Register',
                description: `ID: \`${id}\`\nElement Name: \`${name}\`\nAnime Name: \`${anime}\`\nType: \`${type}\`\nSendedFor: \`${sendedFor}\`\nAcceptedFor: \`${user.id}\``,
                image: { url: attachment.attachment }
            }]
        })
            .catch(() => 5)

        if (messageSavedUrl === 5 || !attachment?.attachment)
            return await interaction.update({
                content: `${e.Deny} | Não foi possível obter a URL da imagem salvada.`,
                embeds: [], components: []
            }).catch(() => { })

        imageUrl = attachment.attachment

        return new Database.Anime({
            acceptedFor: user.id,
            anime, id, imageUrl, name, sendedFor, type
        })
            .save()
            .then(async doc => {

                embed.color = client.green
                embed.footer = { text: 'Sugestão Aceita' }
                client.animes.push(doc)
                removeIndication(id)

                await Database.User.updateOne(
                    { id: sendedFor },
                    {
                        $inc: { Balance: 5000 },
                        $push: {
                            Transactions: {
                                $each: [{
                                    time: `${Date.format(0, true)}`,
                                    data: `${e.gain} Sugestão de *Quiz Anime* aprovada. +5000 Safiras`
                                }],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true }
                )

                return await interaction.update({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Analizar Outra Sugestão',
                                emoji: '🔄',
                                custom_id: JSON.stringify({ c: 'animeQuiz', src: 'anotherOption' }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }]
                }).catch(() => { })
            })
    }

    async function decline() {

        const embed = message?.embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | A embed com os dados não foi encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        const id = embed.fields[0].value
        removeIndication(id)

        embed.color = client.red
        embed.footer = { text: 'Sugestão Deletada' }

        return await interaction.update({
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Analizar Outra Sugestão',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'animeQuiz', src: 'anotherOption' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }], embeds: [embed]
        }).catch(() => { })

    }

    async function removeIndication(id) {

        await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { AnimeQuizIndication: { id } } }
        )
    }
}