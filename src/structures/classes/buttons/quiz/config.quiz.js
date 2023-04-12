import QuizManager from "../../../../classes/games/QuizManager.js";
import custom from "./custom.quiz.js";
import { ButtonStyle } from "discord.js";
import { Database, SaphireClient as client } from "../../../../classes/index.js";
import { Emojis as e } from "../../../../util/util.js";

// Button Interaction
export default async interaction => {

    const { user, channel } = interaction

    if (user.id !== interaction.message?.interaction?.user?.id)
        return await interaction.reply({
            content: `${e.DenyX} | Hey hey hey, peguei no pulo! Que tal você usar o comando e personalizar o seu em?`,
            ephemeral: true
        })

    const userOptions = QuizManager.usersOptions.find(preference => preference?.userId == user.id)

    const customData = {
        userId: user.id,
        gameType: userOptions?.gameType,
        responseTime: userOptions?.responseTime,
        gameRepeat: userOptions?.gameRepeat,
        losePointAtError: userOptions?.losePointAtError,
        shortRanking: userOptions?.shortRanking,
        categories: userOptions?.categories || []
    }

    let control = 0
    let answered = ['redefine']

    const message = await interaction.update({
        content: null,
        embeds: getEmbed(),
        components: getComponents(),
        fetchReply: true
    }).catch(() => { })

    const collector = message.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 1000 * 60 * 2,
        errors: ['idle']
    })
        .on('collect', collected)
        .on('end', ended)

    return;

    function getComponents() {
        if (control < 0) control = 0
        const component = {
            0: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: '⬅️',
                        custom_id: 'toBack',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Botões',
                        emoji: '👆🏼',
                        custom_id: 'buttons',
                        style: ButtonStyle.Primary,
                        disabled: customData.gameType == 'buttons'
                    },
                    {
                        type: 2,
                        label: 'Teclado [Padrão]',
                        emoji: '⌨️',
                        custom_id: 'keyboard',
                        style: ButtonStyle.Primary,
                        disabled: customData.gameType == 'keyboard'
                    }
                ]
            }],
            1: [
                {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'times',
                        placeholder: 'Selecionar tempo de resposta',
                        options: [
                            {
                                label: 'Voltar',
                                emoji: '⬅️',
                                description: 'Voltar para a página anterior',
                                value: 'preview'
                            },
                            ...[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
                                .map(num => ({
                                    label: `${num} Segundos`,
                                    emoji: '⏱️',
                                    description: num == 15 ? 'Este é o tempo padrão' : null,
                                    value: `${1000 * num}`,
                                    default: (1000 * num) == customData.responseTime
                                })),
                        ]
                    }]
                }
            ],
            2: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Voltar',
                            emoji: '⬅️',
                            custom_id: 'preview',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Sem Repetir [Padrão]',
                            emoji: '🫡',
                            custom_id: 'endQuestion',
                            style: ButtonStyle.Primary,
                            disabled: customData.gameRepeat == 'noRepeat'
                        },
                        {
                            type: 2,
                            label: 'Tudo Repetido',
                            emoji: '🎪',
                            custom_id: 'allRepeat',
                            style: ButtonStyle.Primary,
                            disabled: customData.gameRepeat == 'allRepeat'
                        },
                        {
                            type: 2,
                            label: 'Fim das Perguntas',
                            emoji: '📝',
                            custom_id: 'noRepeat',
                            style: ButtonStyle.Primary,
                            disabled: customData.gameRepeat == 'endQuestion'
                        }
                    ]
                }
            ],
            3: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Voltar',
                            emoji: '⬅️',
                            custom_id: 'preview',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Remover',
                            emoji: '😎',
                            custom_id: 'true',
                            style: ButtonStyle.Primary,
                            disabled: customData.losePointAtError == 'true'
                        },
                        {
                            type: 2,
                            label: 'Não Remover [Padrão]',
                            emoji: '🫠',
                            custom_id: 'false',
                            style: ButtonStyle.Primary,
                            disabled: customData.losePointAtError == 'false'
                        }
                    ]
                }
            ],
            4: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Voltar',
                            emoji: '⬅️',
                            custom_id: 'preview',
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Ativar Ranking [Padrão]',
                            emoji: '🏆',
                            custom_id: 'true',
                            style: ButtonStyle.Primary,
                            disabled: customData.shortRanking == 'true'
                        },
                        {
                            type: 2,
                            label: 'Não Mostrar Ranking',
                            emoji: '👨🏼‍🦯',
                            custom_id: 'false',
                            style: ButtonStyle.Primary,
                            disabled: customData.shortRanking == 'false'
                        }
                    ]
                }
            ]
        }[control]

        if (control == 5)
            return buildCategoriesComponents()

        if (userOptions)
            component.unshift({
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'redefine',
                    placeholder: 'Mudar painel de configuração',
                    options: [
                        ...[
                            'Estilo de jogo | Botões/Teclado',
                            'Definição de tempo de resposta',
                            'Estilo de repetição',
                            'Remoção de pontos ao errar',
                            'Ranking personalizado',
                            'Escolher categorias de pergunta'
                        ]
                            .map((description, i) => ({
                                label: `Página ${i + 1}`,
                                emoji: e.amongusdance,
                                description,
                                value: `${i} `,
                            }))
                    ]
                }]
            })

        return component ? component : []
    }

    function getEmbed() {
        if (control < 0) control = 0
        const embed = {
            0: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Vamos começar pelo tipo do jogo, ok?\n${e.Loading} Aguardando resposta - 1/6`,
                fields: [
                    {
                        name: '👆🏼 Botões',
                        value: 'Com os botões, não é necessário escrever as respostas no chat.\n**Mas**, você só pode errar uma única vez.'
                    },
                    {
                        name: '⌨️ Teclado',
                        value: 'No teclado, você tem que escrever as respostas exatas das perguntas.\nNão tem limite para a quantidade de erros.'
                    }
                ],
                footer: {
                    text: 'O modo padrão está definido como Teclado.'
                }
            },
            1: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Ok ok, agora o tempo de cada rodada, qual vai ser?\n${e.Loading} Aguardando resposta - 2/6`,
                fields: [
                    {
                        name: '⏱️ Tempo de Resposta',
                        value: 'Esse tempo é definido para cada rodada do Quiz. O tempo padrão são de **15 segundos**.'
                    },
                    {
                        name: '🪄 Magic Intellisense',
                        value: 'Quanto o tempo de resposta é curto demais, é acrescentado ao tempo de resposta **0,5 segundos por palavra da resposta correta**.\nTempo mínimo para adição: 10 segundos.\nO Magic Intellisense não é válido para o Quiz com Botões.'
                    }
                ],
                footer: {
                    text: 'O tempo padrão é de 10 segundos.'
                }
            },
            2: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Peguei o tempo. E agora? Qual o tipo de repetição?\n${e.Loading} Aguardando resposta - 3/6`,
                fields: [
                    {
                        name: '🫡 Sem Repetir, Porém, Repetindo',
                        value: 'Quando todas as perguntas forem respondidas, as perguntas serão embaralhadas novamente e lançadas novamente.'
                    },
                    {
                        name: '🎪 Tudo Repetido',
                        value: 'As perguntas são repetidas, não tem sequência lógica. Você pode responder a pergunta aqui e a próxima pode ser ela de novo.'
                    },
                    {
                        name: '📝 Fim das Perguntas',
                        value: 'Quando todas as perguntas forem respondidas, o Quiz acaba.'
                    }
                ],
                footer: {
                    text: 'A repetição por padrão é Sem Repetir.'
                }
            },
            3: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Beleza, tudo ok até aqui. E sobre remover pontos?\n${e.Loading} Aguardando resposta - 4/6`,
                fields: [
                    {
                        name: '🏆 Ranking',
                        value: 'Toda partida tem um ranking de quem acerta mais. Na próxima página, você vai poder escolher se quer ou não que ele apareça no meio das partidas.'
                    },
                    {
                        name: `${e.QuestionMark} Como assim remover pontos?`,
                        value: 'A cada acerto você ganha um ponto, certo? Mas e se alguém errar a pergunta?\nEsse Quiz pode tirar um ponto a cada erro. Muito bom, né?\nIsso aumenta muito a competitividade das partidas.'
                    },
                    {
                        name: `${e.Info} Informações Adicionais`,
                        value: 'Esse sistema só é compatível com o estilo de Quiz com Botões.\nJogadores que errarem muito podem ficar com pontos negativos.'
                    }
                ],
                footer: {
                    text: 'A remoção de pontos por padrão é Desativada.'
                }
            },
            4: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Entendido. Toda partida tem um ranking, você quer ele?\n${e.Loading} Aguardando resposta - 5/6`,
                fields: [
                    {
                        name: '🏆 Pequeno Ranking',
                        value: 'A cada pergunta, um pequeno ranking é mostrado com os 3 que mais acertaram perguntas no jogo.'
                    },
                    {
                        name: '📝 Ao Fim da Partida',
                        value: 'Um ranking com os primeiros 50 membros com mais acertos é mostrado com seus respectivos pontos.'
                    },
                    {
                        name: `${e.QuestionMark} Informações Adicionais`,
                        value: 'Esse ranking é compatível com os dois modos de jogo.\nUm arquivo txt é enviado ao fim da partida com todos os dados do jogo.'
                    }
                ],
                footer: {
                    text: 'O padrão do ranking automático é Ativado'
                }
            },
            5: {
                color: client.blue,
                title: `${e.QuizLogo} ${client.user.username}'s Quiz Customization`,
                description: `${e.amongusdance} Estamos na última etapa! Quais perguntas você quer no seu Quiz?\n${e.Loading} Aguardando resposta - 6/6`,
                fields: [
                    {
                        name: '🏷️ Categorias',
                        value: `Esse Quiz, atualmente, possui ${QuizManager.categories.length || 0} categorias de perguntas.\nEm cada categorias, existem diversas perguntas sobre o mesmo tema e você pode escolhe-lhas para o seu Quiz.`
                    },
                    {
                        name: '📨 Enviar Perguntas/Categorias',
                        value: 'Você pode enviar perguntas e categorias clicando em **Mais Opções** no menu inical, beleza?'
                    },
                    {
                        name: `${e.QuestionMark} Informações Adicionais`,
                        value: 'Essa seleção de categorias é compatível com os dois modos de jogo.\nVocê pode editar as suas escolhas a qualquer momento.'
                    }
                ],
                footer: {
                    text: 'Por padrão, Todas as Categorias estão selecionadas'
                }
            }
        }[control]

        return embed ? [embed] : []
    }

    function getContent() {
        const embeds = getEmbed()
        const components = getComponents()

        return embeds.length || components.length
            ? null
            : `${e.KuramaFogo} Por algum motivo desconhecido, essa página não foi encontrada.`
    }

    function preview(int) {
        if (control > 0) control--
        return editMessage(int)
    }

    async function editMessage(int) {
        if (!int?.message) return channel.send({ content: `${e.SaphireWhat} | Whatafocka? A mensagem sumiu.` }).catch(() => { })

        return await int?.update({
            content: getContent(), embeds: getEmbed(), components: getComponents()
        })
            .catch(err => channel.send({ content: `${e.SaphireWhat} | Whaat? Não deu pra editar a mensagem...\n${e.bug} | \`${err}\`` }).catch(() => { }))
    }

    function setGameTime(int) {
        const { values, customId } = int
        const value = values[0]
        if (value == 'preview') return preview(int)
        customData.responseTime = Number(value)
        control++
        if (!answered.includes(customId)) answered.push(customId)
        return editMessage(int)
    }

    function setValue(value, customId, int) {
        customData[value] = customId
        control++
        if (!answered.includes(customId)) answered.push(customId)
        return editMessage(int)
    }

    function buildCategoriesComponents() {

        const SelectMenuCategories = [{
            type: 1,
            components: [{
                type: 3,
                custom_id: 'categories',
                placeholder: 'Selecione as categories',
                max_values: QuizManager.categories.length > 25 ? 24 : QuizManager.categories.length,
                min_values: 1,
                options: [
                    {
                        label: 'Voltar',
                        emoji: '⬅️',
                        description: 'Voltar para a página anterior',
                        value: 'preview'
                    },
                    {
                        label: 'Todas as categorias',
                        emoji: '😎',
                        description: `${QuizManager.questions.length} Perguntas em todas as categorias`,
                        value: 'all'
                    },
                    ...QuizManager.categories
                        .map((category, i) => ({
                            label: category || 'Não encontrado',
                            emoji: '🏷️',
                            description: `${QuizManager?.questions?.filter(q => q?.category == category)?.length || 0} Perguntas nesta categoria`,
                            value: category || `${i} nothing here`,
                            default: customData.categories.includes(category)
                        }))
                ]
            }]
        }]

        if (userOptions)
            SelectMenuCategories.unshift({
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'redefine',
                    placeholder: 'Mudar painel de configuração',
                    options: [
                        ...[
                            'Estilo de jogo | Botões/Teclado',
                            'Definição de tempo de resposta',
                            'Estilo de repetição',
                            'Remoção de pontos ao errar',
                            'Ranking personalizado',
                            'Escolher categorias de pergunta'
                        ]
                            .map((description, i) => ({
                                label: `Página ${i + 1}`,
                                emoji: e.amongusdance,
                                description,
                                value: `${i} `,
                            }))
                    ]
                }]
            })

        if (SelectMenuCategories[0].components[0].options.length > 25)
            SelectMenuCategories[0].components[0].options.length = 25

        return SelectMenuCategories
    }

    function setCategories(int) {
        const { values } = int
        if (values.includes('preview')) return preview(int)

        if (values.includes('all'))
            customData.categories = []
        else {
            for (const i in customData.categories)
                if (!values.includes(customData.categories[i]))
                    customData.categories.splice(i, 1)
                else continue

            for (const v of values)
                if (!customData.categories.includes(v))
                    customData.categories.push(v)
                else continue
        }

        return finishCollection(int)
    }

    async function finishCollection(int) {
        const doc = QuizManager.usersOptions.find(preference => preference?.userId == user.id)

        if (!doc) {
            await Database.Quiz.findOneAndUpdate(
                { category: 'SaveCategories' },
                { $push: { customGameOptions: { $each: [customData] } } },
                { new: true }
            ).then(save).catch(catched)
        }
        else await Database.Quiz.findOneAndUpdate(
            { category: 'SaveCategories', 'customGameOptions.userId': user.id },
            {
                $set: {
                    'customGameOptions.$.gameType': customData.gameType,
                    'customGameOptions.$.responseTime': customData.responseTime,
                    'customGameOptions.$.gameRepeat': customData.gameRepeat,
                    'customGameOptions.$.losePointAtError': customData.losePointAtError,
                    'customGameOptions.$.shortRanking': customData.shortRanking,
                    'customGameOptions.$.categories': customData.categories
                }
            },
            {
                new: true,
                fields: 'customGameOptions'
            }
        ).then(save).catch(catched)

        async function save(document) {
            const userDocument = document.customGameOptions.find(preference => preference?.userId == user.id)
            const index = QuizManager.usersOptions.findIndex(op => op?.userId == user.id)
            index > -1 ? QuizManager.usersOptions.splice(index, 1, userDocument) : QuizManager.usersOptions.push(userDocument)
            return custom(int, userDocument)
        }

        async function catched(err) {
            return await int.update({
                content: `${e.Deny} | Não foi possível salvar suas configurações.\n${e.bug} | \`${err}\``,
                embeds: [], components: []
            }).catch(() => { })
        }

        return collector.stop()
    }

    async function collected(int) {
        const { customId } = int

        const execute = { preview, redefine }[customId]
        if (execute) return execute(int)

        if (customId == 'toBack') {
            collector.stop()
            return custom(int)
        }

        if (customId == 'times')
            return setGameTime(int)

        const values = [
            { type: 'gameType', keys: ['buttons', 'keyboard'], painelOrder: 0 },
            { type: 'gameRepeat', keys: ['repeat', 'endQuestion', 'allRepeat', 'noRepeat'], painelOrder: 2 },
            { type: 'losePointAtError', keys: ['true', 'false'], painelOrder: 3 },
            { type: 'shortRanking', keys: ['true', 'false'], painelOrder: 4 }
        ]

        if (customId == 'categories')
            return setCategories(int)

        const order = values.find(v => v.painelOrder == control)
        if (order) return setValue(order.type, customId, int)

        return await int.update({
            content: `${e.KuramaFogo} Por algum motivo desconhecido, essa página não foi encontrada.`,
            embeds: [],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Voltar',
                            emoji: '⬅️',
                            custom_id: JSON.stringify({ c: 'quiz', src: 'back', userId: int.user.id }),
                            style: ButtonStyle.Primary
                        }
                    ]
                }
            ]
        }).catch(() => { })
    }

    function redefine(int) {
        control = int.values[0]
        return editMessage(int)
    }

    /**
     * reasons from collector end
     * channelDelete - The channel was deleted
     * messageDelete - The message was deleted
     * user - The collector was stop by the user
     * idle - When idleling time is over
     * limit - When max limit action is over
     * time - When time is over
     */
    async function ended(_, reason) {

        if (reason == 'messageDelete')
            return await channel.send({
                content: `${e.DenyX} | Opa opa, a mensagem de configuração foi deletada.\n${e.Info} | ${answered.length - 1}/6 perguntas foram respondidas.`
            }).catch(() => { })

        if (reason == 'idle') {

            const embed = channel.messages.cache.get(message.id)?.embeds[0]?.data

            if (embed) {
                embed.color = client.red
                embed.description = embed.description.replace(e.Loading, e.DenyX)
                embed.fields.push({
                    name: '⌛ O tempo acabou',
                    value: 'O tempo limite de resposta para o questionário chegou ao fim'
                })
            }

            return await message.edit({
                content: null,
                embeds: embed
                    ? [embed]
                    : [{
                        color: client.red,
                        title: `${e.QuizLogo} Saphire Canary's Quiz Customization`,
                        description: '⌛ O tempo limite de resposta para o questionário chegou ao fim'
                    }],
                components: [
                    {
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
                                label: 'Deletar Mensagem',
                                emoji: e.Trash,
                                custom_id: JSON.stringify({ c: 'delete' }),
                                style: ButtonStyle.Danger
                            }
                        ]
                    }
                ]
            }).catch(() => { })
        }

        return
    }

}