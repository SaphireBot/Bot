import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { StringSelectMenuInteraction } from "discord.js"
import QuizManager from "../../../../classes/games/QuizManager.js"
import { Config } from "../../../../util/Constants.js"

/**
 * @param { StringSelectMenuInteraction } interaction
 */
// Select Menu Interaction
export default async interaction => {

    const components = interaction.message.components
    await interaction.update({ content: `${e.Loading} | Carregando...`, components: [], embeds: [] }).catch(() => { })

    const usersThatSendQuestions = QuizManager.questions.map(question => question.suggestedBy)
    const usersId = Array.from(new Set(usersThatSendQuestions))

    const usersFormatted = usersId
        .map(id => {
            const user = client.users.cache.get(id)
            if (!user) return undefined
            const userQuestions = QuizManager.questions.filter(question => question.suggestedBy == id)
            return { tag: `${user.tag} \`${id}\``, questions: userQuestions.length }
        })
        .filter(i => i)
        .slice(0, 15)
        .map(user => `${user.tag} - ${user.questions} Perguntas`)

    const { Names } = Database

    const data = {
        developer: await client.users.fetch(Config.ownerId).then(user => `${user.tag} - \`${user.id}\``).catch(() => `Rody#1000 ${Config.ownerId}`),
        conception: await client.users.fetch(Names.Pepy).then(user => `${user.tag} - \`${user.id}\``).catch(() => `San O.#0001 ${Names.Pepy}`),
        supporter: {
            Andre: await client.users.fetch(Names.Andre).then(user => `${user.tag} - \`${user.id}\``).catch(() => `! ζ͜͡André#1495 ${Names.Andre}`),
            Gorniaky: await client.users.fetch(Names.Gorniaky).then(user => `${user.tag} - \`${user.id}\``).catch(() => `Gorniaky#2023 ${Names.Gorniaky}`)
        },
        questionSenders: usersFormatted.length !== usersId.length
            ? usersFormatted.length
                ? `${usersFormatted.join('\n')}\n+ ${usersId.length - usersFormatted.length} outros usuários`
                : `${usersId.length} usuários`
            : usersFormatted.join('\n')
    }

    return await interaction.message.edit({
        content: null,
        embeds: [{
            color: client.blue,
            title: `${e.jumpStar} Créditos e Agradecimentos`,
            description: `Esta é uma área para eternizar a construção deste comando.\nCom a ajuda de todos, chegamos a marca de **${QuizManager.questions.length} perguntas**.`,
            fields: [
                {
                    name: '💡 Idealizador',
                    value: data.conception
                },
                {
                    name: `${e.Gear} Código Fonte`,
                    value: data.developer
                },
                {
                    name: '🧩 Suporte e Ideias',
                    value: `${data.supporter.Andre}\n${data.supporter.Gorniaky}`
                },
                {
                    name: '📨 Envio de Perguntas',
                    value: data.questionSenders
                }
            ]
        }],
        components
    }).catch(() => { })

}