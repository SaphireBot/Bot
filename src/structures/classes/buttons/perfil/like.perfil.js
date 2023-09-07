import { ButtonInteraction } from "discord.js"
import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'like', a: 'authorId', u: userId } } commandData
 */
export default async (interaction, commandData) => {

    const { a: authorId, u: userId } = commandData
    const { user: author, message } = interaction

    if (author.id !== authorId)
        return interaction.reply({
            content: `${e.DenyX} | Saaaai daí. Você não pode clicar aqui. Xô xô!!`,
            ephemeral: true
        })

    if (userId === authorId)
        return interaction.update({
            content: `${e.Deny} | Você não pode dar likes para você mesmo.`,
            components: []
        }).catch(() => { })

    const user = await message.getUser(userId)

    if (!user)
        return interaction.update({
            content: `${e.Deny} | Nenhum usuário foi encontrado.`,
            components: []
        }).catch(() => { })


    const dbData = await Database.getUsers([authorId, userId])
    const data = {}
    const authorData = dbData.find(d => d.id === authorId)

    if (!authorData) {
        Database.registerUser(author)
        return interaction.update({
            content: `${e.Database} | Nenhum dado seu foi encontrado. Acabei de efetuar o registro. Por favor, tente novamente.`,
            components: []
        }).catch(() => { })
    }

    data.timeout = authorData?.Timeouts?.Rep

    if (Date.Timeout(1800000, data.timeout))
        return interaction.update({
            content: `${e.Deny} | Calminha aí, ok! Outro like só ${Date.Timestamp(new Date(data.timeout + 1800000), 'R', true)}`,
            components: []
        }).catch(() => { })

    const uData = dbData.find(d => d.id === user?.id)

    data.userLikes = uData?.Likes || 0
    Database.addItem(user.id, 'Likes', 1)
    Database.SetTimeout(author.id, 'Timeouts.Rep')

    return interaction.update({ content: `${e.Animated.SaphireDance} | Tudo ok, você deu um like para ${user.username}. Agora, ${user.username} possui ${data.userLikes} likes`, components: [] }).catch(() => { })
}