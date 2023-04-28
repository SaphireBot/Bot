import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { CodeGenerator } from "../../../../functions/plugins/plugins.js"
import { Emojis as e } from "../../../../util/util.js"
import optionsAnime from "../../../commands/slashCommands/games/quiz/anime/options.anime.js"
import validadeAnime from "./validate.anime.js"

export default async (interaction, commandData) => {

    const { message, user } = interaction
    const authorId = message?.interaction?.user?.id

    if (['accept', 'delete', 'edit'].includes(commandData?.src))
        return validadeAnime(interaction, commandData)

    if (commandData?.src === 'anotherOption') {

        if (!client.staff.includes(user.id)) return

        const clientData = await Database.Client.findOne({ id: client.user.id }, 'AnimeQuizIndication')
        const AnimeQuizIndication = clientData?.AnimeQuizIndication || []

        if (!AnimeQuizIndication || !AnimeQuizIndication) {
            await interaction.update({ components: [] }).catch(() => { })
            return interaction.channel.send({ content: `${e.Deny} | Acabou todas as sugestões` })
        }

        interaction.message.edit({ components: [] }).catch(() => { })
        return optionsAnime(interaction, 'analise')
    }

    if (user.id !== authorId) return

    const embed = message?.embeds[0]?.data

    if (!embed)
        return await interaction.update({
            content: `${e.Deny} | A embed com os dados não foi encontrada.`,
            embeds: [], components: []
        }).catch(() => { })

    const elementType = [
        {
            name: 'Anime',
            value: 'anime'
        },
        {
            name: 'Personagem Masculino',
            value: 'male'
        },
        {
            name: 'Personagem Feminino',
            value: 'female'
        },
        {
            name: 'Outros',
            value: 'others'
        }
    ].find(elem => elem.name === embed.fields[2].value)

    const imageUrl = embed.image.url
    const name = embed.fields[0].value
    const anime = embed.fields[1].value
    const type = elementType.value
    const id = CodeGenerator(10)
    const sendedFor = authorId

    if (!imageUrl || !name || !anime || !type || !sendedFor || !id)
        return await interaction.update({
            content: `${e.Deny} | Todos os dados não foram coletados. Por favor, envie sua sugestão novamente.`,
            embeds: [], components: []
        }).catch(() => { })

    const data = { imageUrl, name, anime, type, id, sendedFor }

    return await Database.Client.updateOne(
        { id: client.user.id },
        { $push: { AnimeQuizIndication: data } },
        { new: true }
    )
        .then(async doc => {

            if (doc.modifiedCount !== 1)
                return await interaction.update({
                    content: `${e.Deny} | Algo deu errado em enviar sua solicitação.`,
                    embeds: [], components: []
                })

            return await interaction.update({
                content: `${e.Check} | Obrigada! A sua solicitação foi enviada com sucesso!\n${e.Info} | Se sua solicitação for aceita, você vai ganhar 5,000 Safiras.`,
                embeds: [], components: []
            })
        })
        .catch(async err => {
            return await interaction.update({
                content: `${e.SaphireChorando} | Não foi possível salvar a sua sugestão...\n${e.bug} | \`${err}\``,
                embeds: [], components: []
            })
        })
}