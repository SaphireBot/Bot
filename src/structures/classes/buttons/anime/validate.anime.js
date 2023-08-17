import { AttachmentBuilder, ButtonStyle } from "discord.js"
import { Database, Modals, SaphireClient as client } from "../../../../classes/index.js"
import { Config } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
import { socket } from "../../../../websocket/websocket.js"

export default async (interaction, commandData) => {

    const { user, message } = interaction
    if (!client.staff.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Você não é um membro autorizado para aceitar/deletar solicitações de animes.`,
            ephemeral: true
        })

    if (!Config.webhookAnimeReporter)
        return await interaction.update({
            content: `${e.DenyX} | A webhook principal de reporte não está ativa.`,
            components: [], embeds: []
        }).catch(() => { })

    if (commandData.srcAdd === 'edit') return editApproved()
    if (commandData.src === 'edit') return edit()
    return commandData.src === 'accept' ? accept() : decline()

    async function editApproved() {

        const anime = client.animes.find(an => an.id == commandData.id)

        if (!anime)
            return await interaction.update({ content: `${e.Deny} | Anime não encontrado.`, components: [] })

        if (!anime.name || !anime.anime || !anime.type)
            return await interaction.reply({
                content: `${e.Deny} | Dados estão faltando nesta indicação de personagem/anime.`,
                components: []
            })

        return await interaction.showModal(Modals.editAnimeRequest('correct', anime.name, anime.anime, anime.type, anime.id))

    }

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

        return await interaction.showModal(Modals.editAnimeRequest('edit', name, anime, type))
    }

    async function accept() {

        const embed = message?.embeds[0]?.data

        const msg = await interaction.update({
            content: `${e.Loading} | Validando sugestão...`,
            components: [], embeds: [], fetchReply: true
        }).catch(() => { })

        if (!embed)
            return await msg.edit({
                content: `${e.Deny} | A embed com os dados não foi encontrada.`,
                embeds: [], components: []
            }).catch(() => { })

        const id = embed.fields[0].value
        const name = embed?.fields[1]?.value

        if (client.animes.find(an => an?.id === id)
            || (client.animes.find(an => an?.name?.toLowerCase() === name.toLowerCase())
                && client.animes.filter(an => an?.type === 'anime').find(an => an?.name?.toLowerCase() === name.toLowerCase()))
        ) {
            removeIndication(id)
            embed.color = client.red
            embed.footer = { text: 'Personagem/Anime já registrado' }
            return await msg.edit({ content: null, embeds: [embed] }).catch(() => { })
        }

        const anime = embed?.fields[2]?.value
        const type = embed?.fields[3]?.value
        const sendedFor = commandData.sendedFor
        const acceptedFor = user.id
        let imageUrl = embed?.image?.url

        if (!id || !name || !anime || !type || !imageUrl || !sendedFor)
            return await msg.edit({
                content: `${e.Deny} | Os dados de validação não estão completos`,
                embeds: [], components: []
            }).catch(() => { })

        const attachment = new AttachmentBuilder(imageUrl, { name: `${id}.${imageUrl.split('.').pop()}`, description: 'Saphire Anime Quiz' })

        const messageSavedUrl = await Config.webhookAnimeReporter.send({
            content: `${name}`,
            embeds: [{
                color: client.blue,
                title: '📝 Anime Register',
                description: `ID: \`${id}\`\nElement Name: \`${name}\`\nAnime Name: \`${anime}\`\nType: \`${type}\`\nSendedFor: \`${sendedFor}\`\nAcceptedFor: \`${user.id}\``,
            }],
            files: [attachment]
        })
            .catch(error => error.code)

        if (!isNaN(messageSavedUrl)) {

            if (messageSavedUrl == 40005) {
                await msg.edit({
                    content: `${e.DenyX} | O tamanho da imagem é maior que 8 MiB (8.38 MB - 8388.6 kB).`,
                    embeds: [], components: []
                })
                return await decline(embed, msg)
            }

        }

        if (messageSavedUrl !== 5)
            imageUrl = messageSavedUrl?.attachments[0]?.url

        if (messageSavedUrl === 5 || !imageUrl)
            return await msg.edit({
                content: null,
                content: `${e.Deny} | Não foi possível obter a URL da imagem salvada.`,
                embeds: [], components: []
            }).catch(() => { })

        return new Database
            .Anime({ acceptedFor, anime, id, imageUrl, name, sendedFor, type })
            .save()
            .then(async doc => {

                embed.color = client.green
                embed.footer = { text: 'Sugestão Aceita' }
                client.animes.push(doc)
                removeIndication(id, true)

                const transaction = {
                    time: `${Date.format(0, true)}`,
                    data: `${e.gain} Sugestão de *Quiz Anime* aprovada. +5000 Safiras`
                }

                socket?.send({
                    type: "transactions",
                    transactionsData: { value: 5000, userId: sendedFor, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: sendedFor },
                    {
                        $inc: { Balance: 5000 },
                        $push: {
                            Transactions: {
                                $each: [transaction],
                                $position: 0
                            }
                        }
                    },
                    { upsert: true, new: true }
                )
                    .then(doc => Database.saveUserCache(doc?.id, doc))

                return await msg.edit({
                    content: null,
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Analisar Outra Sugestão',
                                emoji: '🔄',
                                custom_id: JSON.stringify({ c: 'animeQuiz', src: 'anotherOption' }),
                                style: ButtonStyle.Primary
                            }
                        ]
                    }]
                }).catch(() => { })
            })
            .catch(async err => {

                embed.color = client.red
                embed.footer = { text: 'Erro na validação' }

                embed.fields.push({
                    name: `${e.bug} Bug Bug Bug`,
                    value: `\`${err}\``
                })

                if (msg)
                    return await msg.edit({
                        content: null,
                        embeds: [embed],
                        components: [{
                            type: 1,
                            components: [{
                                type: 2,
                                label: 'Analisar Outra Sugestão',
                                emoji: '🔄',
                                custom_id: JSON.stringify({ c: 'animeQuiz', src: 'anotherOption' }),
                                style: ButtonStyle.Primary
                            }]
                        }]
                    }).catch(() => { })
                else {
                    interaction.message?.delete().catch(() => { })
                    msg?.delete().catch(() => { })
                    return await interaction.channel.send({ content: `${e.Deny} | Nenhuma mensagem foi encontrada.` })
                }
            })
    }

    async function decline(embedData, msg) {

        const embed = embedData || message?.embeds[0]?.data

        if (!embed)
            return edit({
                content: `${e.Deny} | A embed com os dados não foi encontrada.`,
                embeds: [], components: []
            })

        const id = commandData?.id || embed.fields[0].value
        removeIndication(id)

        embed.color = client.red
        embed.footer = { text: 'Sugestão Deletada' }

        return edit({
            content: null,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Analisar Outra Sugestão',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'animeQuiz', src: 'anotherOption' }),
                        style: ButtonStyle.Primary
                    }
                ]
            }],
            embeds: [embed]
        })

        async function edit(data) {
            return msg
                ? await msg.edit(data).catch(() => { })
                : await interaction.update(data).catch(() => { })
        }
    }

    async function removeIndication(id, isIndication) {

        if (!isIndication) {
            await Database.Anime.deleteOne({ id: id })

            client.animes.splice(
                client.animes.findIndex(an => an.id == id),
                1
            )
        }

        await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { AnimeQuizIndication: { id } } }
        )

    }
}