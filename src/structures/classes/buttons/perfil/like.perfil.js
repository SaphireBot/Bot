import {
    Database,
    SaphireClient as client
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, userId) => {

    const { user: author, message } = interaction
    const user = await client.users.fetch(userId, { force: true })
        .catch(() => null)

    if (!user)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum usuário foi encontrado.`,
            ephemeral: true
        })

    if (user.id === author.id)
        return await interaction.reply({
            content: `${e.Deny} | Você não pode dar likes para você mesmo.`,
            ephemeral: true
        })

    const dbData = await Database.User.find({ id: { $in: [author.id, user?.id] } }, 'id Timeouts.Rep Likes')
    const data = {}
    const authorData = dbData.find(d => d.id === author.id)

    if (!authorData) {
        Database.registerUser(author)
        return await interaction.reply({
            content: `${e.Database} | Nenhum dado seu foi encontrado. Acabei de efetuar o registro. Por favor, tente novamente.`,
            ephemeral: true
        })
    }

    data.timeout = authorData?.Timeouts?.Rep

    if (Date.Timeout(1800000, data.timeout))
        return await interaction.reply({
            content: `${e.Deny} | Calminha aí, ok! Outro like só ${Date.Timestamp(new Date(data.timeout + 1800000), 'R', true)}`,
            ephemeral: true
        })

    const uData = dbData.find(d => d.id === user?.id)

    data.userLikes = uData?.Likes || 0
    Database.addItem(user.id, 'Likes', 1)
    Database.SetTimeout(author.id, 'Timeouts.Rep')

    const { components } = message
    const componentsJSON = components[0].toJSON()
    const objectComponents = componentsJSON.components
    objectComponents[0].options[0].label = `${data.userLikes + 1} likes`

    return await interaction.update({ components: [componentsJSON] }).catch(() => { })
}