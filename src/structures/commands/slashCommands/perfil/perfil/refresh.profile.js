import { Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async (interaction) => {

    await interaction.reply({
        content: `${e.Loading} | Buscando e atualizando perfil...`
    })

    const { user } = interaction
    const authorData = await Database.User.findOne({ id: user.id }, 'id Perfil.Parcas Perfil.Family')
    const parcas = authorData?.Perfil?.Parcas || []
    const family = authorData?.Perfil?.Family || []
    const queryId = [...parcas, ...family]

    if (!queryId.length)
        return await interaction.editReply({
            content: `${e.Deny} | Não há nada no seu perfil para ser atualizado.`
        }).catch(() => { })

    const data = await Database.User.find({ id: { $in: queryId } }, 'id Perfil.Parcas Perfil.Family')

    if (parcas.length > 0)
        for (const id of parcas) {
            const userData = data.find(d => d.id === id)
            if (userData?.Perfil?.Parcas?.includes(user.id)) continue
            Database.pullUserData(user.id, 'Perfil.Parcas', id)
            Database.pullUserData(id, 'Perfil.Parcas', user.id)
        }

    if (family.length > 0)
        for (const id of family) {
            const userData = data.find(d => d.id === id)
            if (userData?.Perfil?.Family?.includes(user.id)) continue
            Database.pullUserData(user.id, 'Perfil.Family', id)
            Database.pullUserData(id, 'Perfil.Family', user.id)
        }

    return await interaction.editReply({
        content: `${e.Check} | Perfil atualizado com sucesso!`
    }).catch(() => { })

}