import { Database } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'

export default async (query, interaction) => {

    const { user, guild } = interaction
    const playersInGame = await Database.Cache.WordleGame.get('inGame') || []
    const gameUser = playersInGame?.find(value => value?.userId === user.id)

    return guild.members.fetch({ user: query })
        .then(members => addPlayersToGame(members))
        .catch(async () => await interaction.reply({ content: `${e.Deny} | Nenhum usuário foi achado.`, ephemeral: true }))

    async function addPlayersToGame(result) {

        const resultMembers = [...new Set(result?.toJSON()?.map(u => u.id))].filter(userId => userId !== user.id)

        if (!resultMembers || resultMembers.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Você deve adicionar um ou mais players na partida. E não, você não pode se "auto-adicionar".`,
                ephemeral: true
            })

        if (!gameUser)
            return import('./create.wordle.js').then(create => create.default(interaction, resultMembers))

        const data = await Database.Cache.WordleGame.get(gameUser.messageId)

        if (!data) {
            await Database.Cache.WordleGame.delete(gameUser.messageId)
            await Database.Cache.WordleGame.pull('inGame', data => data.userId === user.id)

            return await interaction.reply({
                content: `${e.Deny} | Os seus dados do Wordle Game estão inválidos. Por favor, crie um novo.`
            })
        }

        data.Players.push(...resultMembers)
        data.Players = [...new Set(data.Players)]

        await Database.Cache.WordleGame.set(gameUser.messageId, data)
        return await interaction.reply({
            content: `${e.Check} | Agora a sua partida tem um total de ${data.Players.length || 0} jogadores`
        })
    }
}