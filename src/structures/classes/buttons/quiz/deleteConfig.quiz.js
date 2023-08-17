import { ButtonStyle } from "discord.js";
import QuizManager from "../../../../classes/games/QuizManager.js";
import { SaphireClient as client, Database } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button Interaction
export default async interaction => {

    const { user, message, customId } = interaction

    if (user.id !== message.interaction?.user?.id)
        return await interaction.reply({
            content: `${e.DenyX} | Apenas quem usou o comando pode socilitar a exclusão da preferência de jogo, ok?`,
            ephemeral: true
        })

    const userOptions = QuizManager.usersOptions.find(opt => opt?.userId == user.id)

    if (!userOptions)
        return await interaction.update({
            content: `${e.DenyX} | Você não tem nada aqui para ser deletado, ok?`,
            embeds: [],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: 'Voltar',
                    emoji: '⬅️',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'custom', userId: user.id }),
                    style: ButtonStyle.Primary
                }]
            }]
        }).catch(() => { })

    const customIdData = JSON.parse(customId)
    if (customIdData?.confirm) return remove()

    const customData = {
        userId: user.id,
        responseTime: userOptions?.responseTime ? Date.stringDate(userOptions.responseTime) : 'Não Definido',
        gameType: userOptions?.gameType == 'keyboard' ? 'Teclado' : userOptions?.gameType == 'buttons' ? 'Botões' : 'Não Definido',
        gameRepeat: userOptions?.gameRepeat ? 'Sim' : 'Não',
        losePointAtError: userOptions?.losePointAtError ? 'Sim' : 'Não',
        shortRanking: userOptions?.shortRanking ? 'Sim' : 'Não',
        categories: userOptions?.categories?.length ? userOptions.categories.map((category, i) => `\n${i + 1}. \`${category}\``).join('') || 'Todas' : 'Todas',
    }

    let fieldValue = 'Você ainda não definiu nenhuma configuração.'

    if (userOptions)
        fieldValue = `⏱️ Tempo de Resposta: ${customData.responseTime}\n📝 Tipo de Jogo: ${customData.gameType}\n🔄 Perguntas Repetidas: ${customData.gameRepeat}\n⬇️ Perca de Pontos ao Errar: ${customData.losePointAtError}\n🏆 Pequeno Ranking: ${customData.shortRanking}\n🏷️ Categorias: ${customData.categories}`

    return await interaction.update({
        content: null,
        embeds: [{
            color: 0x4c048d,
            title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
            description: 'Aqui você pode configurar o Quiz do seu jeito.\nTempo de resposta? Com ou sem botões? Perguntas?\nVocê escolhe o que você quiser.',
            thumbnail: {
                url: 'https://media.discordapp.net/attachments/893361065084198954/1084184092616183898/i-have-an-idea-light-bulb-icon-motion-design-animation_49.gif?width=624&height=468'
            },
            fields: [
                {
                    name: '⚙️ Configuração Padrão',
                    value: '⏱️ Tempo de Resposta: 15 Segundos\n📝 Tipo de Jogo: Escrito\n🔄 Perguntas Repetidas: Não\n⬇️ Perca de Pontos ao Errar: Não\n🏆 Pequeno Ranking: Sim\n🏷️ Categorias: Todas'
                },
                {
                    name: '⚙️ Suas Configurações',
                    value: fieldValue
                }
            ]
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Voltar',
                    emoji: '⬅️',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'custom', userId: user.id }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Confirmar Exclusão',
                    emoji: e.Trash,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'deleteConfig', userId: user.id, confirm: true }),
                    style: ButtonStyle.Danger,
                    disabled: userOptions?.userId ? false : true
                }
            ]
        }]
    }).catch(() => { })

    async function remove() {

        QuizManager.usersOptions.splice(
            QuizManager.usersOptions.findIndex(preference => preference?.userId == user.id),
            1
        )

        return await Database.Quiz.updateOne(
            { category: 'SaveCategories' },
            { $pull: { customGameOptions: { userId: user.id } } }
        )
            .then(async () => await interaction.update({
                content: `${e.CheckV} | As suas preferências foram removidas com sucesso.`,
                embeds: [],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'custom', userId: user.id }),
                        style: ButtonStyle.Primary
                    }]
                }]
            }))
            .catch(async err => await interaction.update({
                content: `${e.DenyX} | Não foi possível remover as suas preferências.\n${e.bug} | \`${err}\``,
                embeds: [],
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: JSON.stringify({ c: 'quiz', src: 'custom', userId: user.id }),
                        style: ButtonStyle.Primary
                    }]
                }]
            }))

    }

}