import { ButtonStyle } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";
import QuizManager from "../../../../classes/games/QuizManager.js";

// Button Interaction
export default async (interaction, document = false) => {

    const { user } = interaction

    if (user.id !== interaction.message?.interaction?.user?.id)
        return await interaction.reply({
            content: `${e.DenyX} | Eai princesa, tudo bom? Só personaliza quem usa o comando, sabia?`,
            ephemeral: true
        })

    const userOptions = document || QuizManager.usersOptions.find(opt => opt?.userId == user.id)

    const customData = {
        userId: user.id,
        responseTime: userOptions?.responseTime ? Date.stringDate(userOptions.responseTime) : 'Não Definido',
        gameType: userOptions?.gameType == 'keyboard' ? 'Teclado' : userOptions?.gameType == 'buttons' ? 'Botões' : 'Não Definido',
        gameRepeat: userOptions?.gameRepeat ? 'Sim' : 'Não',
        losePointAtError: userOptions?.losePointAtError ? 'Sim' : 'Não',
        shortRanking: userOptions?.shortRanking ? 'Sim' : 'Não',
        categories: userOptions?.categories?.length
            ? userOptions.categories.map((category, i) => {
                let num = i + 1
                if (num < 10) num = `0${num}`
                return `\n${num}. \`${category}\``
            }).join('')
            || 'Todas'
            : 'Todas',
    }

    let fieldValue = 'Você ainda não definiu nenhuma configuração.'

    if (userOptions)
        fieldValue = `⏱️ Tempo de Resposta: ${customData.responseTime}\n📝 Tipo de Jogo: ${customData.gameType}\n🔄 Perguntas Repetidas: ${customData.gameRepeat}\n⬇️ Perca de Pontos ao Errar: ${customData.losePointAtError}\n🏆 Pequeno Ranking: ${customData.shortRanking}\n🏷️ Categorias: ${customData.categories}`

    return await interaction.update({
        content: null,
        embeds: [{
            color: client.blue,
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
                    custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: user.id }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Configurar',
                    emoji: '⚙️',
                    custom_id: JSON.stringify({ c: 'quiz', src: 'config', userId: user.id }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Deletar Configuração',
                    emoji: e.Trash,
                    custom_id: JSON.stringify({ c: 'quiz', src: 'deleteConfig', userId: user.id }),
                    style: ButtonStyle.Danger,
                    disabled: userOptions?.userId ? false : true
                }
            ]
        }]
    })
}