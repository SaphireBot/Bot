export default new class Modals {

    get modals() {
        return { ...this }
    }

    /**
     * @param { string[] } prefixes 
     */
    setPrefix = prefixes => {
        return {
            title: "Configuração de Prefixos",
            custom_id: 'setPrefix',
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: `prefix1`,
                            label: `Prefixo 1`,
                            style: 1,
                            placeholder: "Digite um prefixo",
                            required: true,
                            value: prefixes[0] || undefined,
                            min_length: 1,
                            max_length: 3,
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: `prefix2`,
                            label: `Prefixo 2`,
                            style: 1,
                            placeholder: "Digite um prefixo",
                            required: false,
                            value: prefixes[1] || undefined,
                            min_length: 1,
                            max_length: 3,
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: `prefix3`,
                            label: `Prefixo 3`,
                            style: 1,
                            placeholder: "Digite um prefixo",
                            required: false,
                            value: prefixes[2] || undefined,
                            min_length: 1,
                            max_length: 3,
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: `prefix4`,
                            label: `Prefixo 4`,
                            style: 1,
                            placeholder: "Digite um prefixo",
                            required: false,
                            value: prefixes[3] || undefined,
                            min_length: 1,
                            max_length: 3,
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: `prefix5`,
                            label: `Prefixo 5`,
                            style: 1,
                            placeholder: "Digite um prefixo",
                            required: false,
                            value: prefixes[4] || undefined,
                            min_length: 1,
                            max_length: 3,
                        }
                    ]
                }
            ]
        }
    }

    giveawayDefineMultJoins = roles => {
        if (!roles?.length) return

        return {
            title: "GIVEAWAY | Multiplas Entradas",
            custom_id: 'ModalMultipleJoins',
            components: roles
                .map(role => ({
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: role?.id,
                            label: role.name,
                            style: 1,
                            placeholder: "1, 2, 3, 4, 5... Max: 100",
                            required: true,
                            value: role.joins || "1"
                        }
                    ]
                }
                ))
        }
    }

    reconfigureReminder = (messageId, userId) => {
        return {
            title: "Lembrete",
            custom_id: JSON.stringify({ messageId, userId, c: "reminderTime" }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "time",
                            label: "Nova tempo/data",
                            style: 1,
                            placeholder: "20m | amanhã 17:00 | 30m 10s | 26/06/2024 12:00 | ...",
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    newHangman = {
        title: `Jogo da Forca | New Game`,
        custom_id: JSON.stringify({ c: "hangman", src: 'new' }),
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "word",
                        label: "Palavra do jogo",
                        style: 1,
                        min_length: 3,
                        max_length: 30,
                        placeholder: "Digite uma palavra sem acentos e espaços",
                        required: true
                    }
                ]
            }
        ]
    }

    hangmanNewWord = (word, placeholder) => {
        return {
            title: `Jogo da Forca | ${word.length} Letras`,
            custom_id: JSON.stringify({ c: "hangman", src: word, t: 'word' }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "word",
                            label: "Tente acertar a palavra",
                            style: 1,
                            min_length: word.length,
                            max_length: word.length,
                            placeholder,
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    hangmanNewLetter = (word, placeholder) => {
        return {
            title: `Jogo da Forca | ${word.length} Letras`,
            custom_id: JSON.stringify({ c: "hangman", src: word, t: 'letter' }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "letter",
                            label: "Escolha uma letra (sem acento)",
                            style: 1,
                            min_length: 1,
                            max_length: 1,
                            placeholder,
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    newCategoryName = category => {
        return {
            title: "Edição de Nome da Categoria",
            custom_id: JSON.stringify({ c: "newQuizCatEdit", src: category }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "categoryName",
                            label: "Nome da Categoria",
                            style: 1,
                            min_length: 3,
                            max_length: 50,
                            placeholder: "Digite o nome da categoria",
                            required: true,
                            value: category
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }
    }

    addOrEditCuriosity = question => {

        const components = []

        for (let i = 0; i <= 2; i++) {
            const curiosity = question?.curiosity[i] || null
            components.push({
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: `curiosity-${i}`,
                        label: "Digite uma super curiosidade",
                        style: 2,
                        min_length: 5,
                        max_length: 340,
                        placeholder: "Você pode que colocar uma curiosidade bem curiosa",
                        required: false,
                        value: curiosity
                    }
                ]
            })
            continue
        }

        return {
            title: "Editar/Adicionar Curiosidades",
            custom_id: JSON.stringify({ c: "newQuizEditCuriosity" }),
            components
        }
    }

    addCuriosity = question => {

        const components = []

        for (let i = 0; i <= 2; i++) {
            const curiosity = question?.curiosity[i] || null
            components.push({
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: `curiosity-${i}`,
                        label: "Digite uma super curiosidade",
                        style: 2,
                        min_length: 5,
                        max_length: 340,
                        placeholder: "Você pode que colocar uma curiosidade bem curiosa",
                        required: false,
                        value: curiosity
                    }
                ]
            })
            continue
        }

        return {
            title: "Editar/Adicionar Curiosidades",
            custom_id: JSON.stringify({ c: "newQuizCuriosity" }),
            components
        }
    }

    feedbackModal = questionId => {
        return {
            title: "Report Feedback",
            custom_id: JSON.stringify({ c: "newQuizfeedback", id: questionId }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "feedback",
                            label: "Comentário de feedback do reporte",
                            style: 2,
                            min_length: 5,
                            max_length: 100,
                            placeholder: "Seu reporte foi analisado com sucesso. Obrigado.",
                            required: true,
                            value: "Seu reporte foi analisado com sucesso. Obrigado."
                        }
                    ]
                }
            ]
        }
    }

    RefuseReason = questionId => {
        return {
            title: "Recusa de Indicação",
            custom_id: JSON.stringify({ c: "newQuizRefuse", id: questionId }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "reason",
                            label: "Razão da recusa",
                            style: 2,
                            min_length: 5,
                            max_length: 500,
                            placeholder: "As respostas não condiz com a pergunta. Por favor, coloque respostas originais e reenvie a pergunta.",
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    newQuizReport = questionId => {
        return {
            title: "Quiz System Report",
            custom_id: JSON.stringify({ c: "newQuizReport", id: questionId }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "content",
                            label: "Escreva seu reporte detalhadamente",
                            style: 2,
                            min_length: 30,
                            max_length: 4000,
                            placeholder: "Essa pergunta tem respostas que não tem condiz com a pergunta...",
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    editQuestionData = (question, isAdmin, byReport) => {
        return {
            title: "Indication Edition Request",
            custom_id: JSON.stringify({ c: isAdmin ? "newQuizEditionAdmin" : "newQuizEdition", category: question.category, byReport }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "question",
                            label: "Pergunta",
                            style: 1,
                            min_length: 4,
                            max_length: 500,
                            placeholder: question.question.length < 10 ? question.question : "Porquê o céu é azul?",
                            required: true,
                            value: question.question.length < 10 ? null : question.question
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "correctQuestion",
                            label: "Resposta Correta",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Azul",
                            required: true,
                            value: question.answers[0].answer
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong1",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 1",
                            required: true,
                            value: question.answers[1].answer
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong2",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 2",
                            required: true,
                            value: question.answers[2].answer
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong3",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 3",
                            required: true,
                            value: question.answers[3].answer
                        }
                    ]
                },
            ]
        }
    }

    newQuizQuestion = (category) => {
        let title = `Pergunta para: ${category}`

        if (title.length > 45)
            title = title.slice(0, 42) + '...'

        return {
            title,
            custom_id: JSON.stringify({ c: "newQuizQuestion", category }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "question",
                            label: "Pergunta",
                            style: 1,
                            min_length: 4,
                            max_length: 500,
                            placeholder: "Por que o céu é azul?",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "correctQuestion",
                            label: "Resposta Correta",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Azul",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong1",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 1",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong2",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 2",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "wrong3",
                            label: "Resposta Errada",
                            style: 1,
                            min_length: 1,
                            max_length: 80,
                            placeholder: "Resposta Errada 3",
                            required: true
                        }
                    ]
                },
            ]
        }
    }

    newQuizCategory = {
        title: "Nova Categoria do Quiz",
        custom_id: JSON.stringify({ c: "newQuizCategory" }),
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "category",
                        label: "Nome da Categoria",
                        style: 1,
                        min_length: 3,
                        max_length: 50,
                        placeholder: "Conhecimentos Gerais",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "reason",
                        label: "Motivo da criação",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Essa é uma boa categoria para o quiz, porque...",
                        required: true
                    }
                ]
            }
        ]
    }

    globalChat = {
        title: "Saphire Global Chat",
        custom_id: "saphireGlobalChat",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "content",
                        label: "Mensagem a ser enviada",
                        style: 2,
                        min_length: 10,
                        max_length: 900,
                        placeholder: "Eai galera, tudo bem?",
                        required: true
                    }
                ]
            } // MAX: 5 Fields
        ]
    }

    editAnimeRequest = (customId, name, anime, type, id) => {
        return {
            title: "Anime Quiz Indication | Edition Painel",
            custom_id: JSON.stringify({ c: 'anime', src: customId, id }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "name",
                            label: "Nome do Personagem/Anime",
                            style: 1,
                            min_length: 1,
                            max_length: 1024,
                            value: name,
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "anime",
                            label: "Nome do Anime",
                            style: 1,
                            min_length: 2,
                            max_length: 1000,
                            value: anime,
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "type",
                            label: "Tipo do Elemento",
                            style: 1,
                            min_length: 2,
                            max_length: 1000,
                            value: type,
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }
    }

    ReminderEdit = (hour, message, reminderId) => {
        return {
            title: "Edição de Lembrete",
            custom_id: JSON.stringify({ c: 'reminder', reminderId }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "message",
                            label: "Mensagem",
                            style: 2,
                            min_length: 1,
                            max_length: 1024,
                            value: message,
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "date",
                            label: "Data",
                            style: 1,
                            min_length: 2,
                            max_length: 1000,
                            value: hour,
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }
    }

    SendCanta = {
        title: "Nova Cantada",
        custom_id: 'cantada',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "cantada",
                        label: "Cantada",
                        style: 1,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Sabe quando eu penso em você...",
                        required: true
                    }
                ]
            } // MAX: 5 Fields
        ]
    }

    addEmoji = {
        title: "Add Emoji at Handler",
        custom_id: 'addemoji',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "name",
                        label: "Nome do emoji na handler",
                        style: 1,
                        min_length: 1,
                        placeholder: "emojiName",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "emoji",
                        label: "Nome do \\emoji",
                        style: 1,
                        min_length: 1,
                        placeholder: "<:emojiName:123456789123456798>",
                        required: true
                    }
                ]
            }
        ]
    }

    NewNotice = {
        title: "Notice Builder Painel",
        custom_id: 'notice',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "title",
                        label: "Título",
                        style: 1,
                        min_length: 10,
                        max_length: 100,
                        placeholder: "Um usuário cometeu um erro",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "notice",
                        label: "Descrição",
                        style: 2,
                        min_length: 50,
                        max_length: 4000,
                        placeholder: "No dia 01/01/2001 um usuário de drogas...",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "font",
                        label: "Fonte",
                        style: 1,
                        min_length: 10,
                        placeholder: "https://g1.globo.com/fantastico/noticia...",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "thumbnail",
                        label: "Imagem da Thumbnail",
                        style: 1,
                        placeholder: "Link da Thumbnail",
                        required: false
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "image",
                        label: "Imagem da Notícia",
                        style: 1,
                        placeholder: "Link da Imagem",
                        required: false
                    }
                ]
            }
        ]
    }

    reportBalance(user) {
        return {
            title: "Balance Report Central",
            custom_id: JSON.stringify({ c: 'reportBalance', src: user.id }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'report',
                            label: "Explique o que aconteceu",
                            style: 2,
                            min_length: 10,
                            max_length: 4000,
                            placeholder: "Eu tentei iniciar uma rodada de /blackjack e...",
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    addFanart(user) {
        return {
            title: "Add Fanart Painel",
            custom_id: JSON.stringify({ c: 'fanartADD', src: user.id }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'user',
                            label: "Author",
                            style: 1,
                            placeholder: "UserData",
                            required: true,
                            value: `${user.username} - ${user.id}`
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'imageURL',
                            label: "URL da Imagem",
                            style: 1,
                            placeholder: "https://media.discordapp.net/attachments/104189...",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'imageName',
                            label: "Nome da Fanart",
                            style: 1,
                            placeholder: "Saphire Natal",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'socialURL',
                            label: "URL de alguma rede social",
                            style: 1,
                            placeholder: "https://instagram.com/user123",
                            required: false
                        }
                    ]
                },
            ]
        }
    }

    ChannelClone(channel) {
        return {
            title: "Clone Channel",
            custom_id: JSON.stringify({ c: 'channel', id: channel.id, method: 'clone' }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'channelName',
                            label: "Novo nome do canal (1~100 Caracteres)",
                            style: 1,
                            min_length: 1,
                            max_length: 100,
                            placeholder: "Novo nome...",
                            required: true,
                            value: channel?.name || null
                        }
                    ]
                }
            ]
        }
    }

    editTopic(channel) {
        return {
            title: "Edit Channel Topic",
            custom_id: JSON.stringify({ c: 'channel', id: channel.id, method: 'topic' }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'channelTopic',
                            label: "Editar tópico (1~1024 caracteres)",
                            style: 2,
                            min_length: 1,
                            max_length: 1024,
                            placeholder: "Novo tópico...",
                            required: true,
                            value: channel?.topic || null
                        }
                    ]
                }
            ]
        }
    }

    editChannelName(channel) {
        return {
            title: "Edit Channel Name",
            custom_id: JSON.stringify({ c: 'channel', id: channel.id, method: 'editName' }),
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'channelName',
                            label: "Editar nome (1~100 caracteres)",
                            style: 1,
                            min_length: 1,
                            max_length: 100,
                            placeholder: "Novo nome...",
                            required: true,
                            value: channel?.name || null
                        }
                    ]
                }
            ]
        }
    }

    logomarcaBug = {
        title: "Logomarca Bug Reporter",
        custom_id: "logomarcaReporter",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "bug",
                        label: "Erro/Bug",
                        style: 1,
                        min_length: 3,
                        max_length: 200,
                        placeholder: "Imagem não aparece...",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "description",
                        label: "Descrição do Erro/Bug",
                        style: 2,
                        min_length: 3,
                        max_length: 4000,
                        placeholder: "Quando eu clico no botão certo, a Saphire não vê isso e aquilo...",
                        required: true
                    }
                ]
            }
        ]
    }

    indicateAnime = (customId, name) => {
        return {
            title: "Anime Indications",
            custom_id: customId || "animeIndications",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "name",
                            label: "Nome do anime",
                            style: 1,
                            min_length: 3,
                            max_length: 1024,
                            placeholder: "Naruto",
                            value: name || null,
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    vocePrefere = (questionOne, questionTwo, customId) => {
        return {
            title: 'Você Prefere - New Question',
            custom_id: customId || 'rather',
            components: [
                {
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'questionOne',
                        label: 'Questão 1',
                        style: 1,
                        placeholder: 'Ser algo...',
                        min_length: 5,
                        max_length: 1024,
                        required: true,
                        value: questionOne || null
                    }]
                },
                {
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'questionTwo',
                        label: 'Questão 2',
                        style: 1,
                        placeholder: 'Ser alguém...',
                        min_length: 5,
                        max_length: 1024,
                        required: true,
                        value: questionTwo || null
                    }]
                }
            ]
        }
    }

    adminEditVocePrefere = (questionOne, questionTwo, customId) => {
        return {
            title: 'Você Prefere - Admin Edit Question',
            custom_id: `rather_${customId}`,
            components: [
                {
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'questionOne',
                        label: 'Questão 1',
                        style: 1,
                        placeholder: 'Ser algo...',
                        min_length: 5,
                        max_length: 1024,
                        required: true,
                        value: questionOne || null
                    }]
                },
                {
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'questionTwo',
                        label: 'Questão 2',
                        style: 1,
                        placeholder: 'Ser alguém...',
                        min_length: 5,
                        max_length: 1024,
                        required: true,
                        value: questionTwo || null
                    }]
                }
            ]
        }
    }

    BalanceModal = (option, user, userMoney) => {

        const label = {
            add: 'Adicionar valor',
            remove: 'Remover valor',
            reconfig: 'Reconfigurar um novo valor'
        }[option]

        return {
            title: 'Balance Administrator Center',
            custom_id: 'balance',
            components: [
                {
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: `${user.id}_${option}`,
                        label: label || 'Valor não reconhecido',
                        style: 1,
                        placeholder: `${user.username} possui ${userMoney} Safiras`,
                        required: true
                    }]
                }
            ]
        }
    }

    newAnimeCharacter = {
        title: 'New Anime Character Quiz Data',
        custom_id: "newAnimeCharacter",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "name",
                        label: "Nome do personagem",
                        style: 1,
                        placeholder: "Naruto",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "image",
                        label: "Link da imagem",
                        style: 1,
                        placeholder: "https://media.discordapp.net/attachments/977336529129209907/977342165632036914/unknown.png",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "anime",
                        label: "Nome do Anime",
                        style: 1,
                        placeholder: "Naruto Shippuden",
                        required: true
                    }
                ]
            }
        ]
    }

    ideia = (title, customId, label, placeholder) => {
        return {
            title: title,
            custom_id: customId,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "text",
                            label: label,
                            style: 2,
                            min_length: 10,
                            placeholder: placeholder,
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    newFlag = {
        title: "Create New Flag",
        custom_id: "newFlagCreate",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "flag",
                        label: "Emoji da bandeira",
                        style: 1,
                        placeholder: "emoji",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "country",
                        label: "Nome da bandeira",
                        style: 1,
                        placeholder: "Brasil, Austria, Argentina...",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "country1",
                        label: "Adicionar Sinônimo",
                        style: 1,
                        placeholder: "Brazil, Usa, Eua..."
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "country2",
                        label: "Adicionar Sinônimo +",
                        style: 1,
                        placeholder: "United States, Australia..."
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "image",
                        label: "Link da imagem da bandeira",
                        style: 1,
                        placeholder: "https://media.discordapp.net/attachments/975974003229474846/990387818176065557/unknown.png",
                        required: true
                    }
                ]
            }
        ]
    }

    editFlag = (emoji, name, image) => {
        return {
            title: "Edit Flag Info",
            custom_id: name,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "flag",
                            label: "Emoji da bandeira",
                            style: 1,
                            placeholder: "emoji",
                            required: true,
                            value: emoji || null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "country",
                            label: "Nome da bandeira",
                            style: 1,
                            placeholder: "Brasil, Austria, Argentina...",
                            value: '/bandeiras options flag-adminstration:'
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "image",
                            label: "Link da imagem da bandeira",
                            style: 1,
                            placeholder: "https://media.discordapp.net/attachments/975974003229474846/990387818176065557/unknown.png",
                            required: true,
                            value: image || null
                        }
                    ]
                }
            ]
        }
    }

    sendLetter = {
        title: 'New Letter',
        custom_id: "newLetter",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "username",
                        label: "Para quem é a carta?",
                        style: 1,
                        min_length: 2,
                        max_length: 37,
                        placeholder: "Nome, Nome#0000 ou ID",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "anonymous",
                        label: "Está é um carta anonima?",
                        style: 1,
                        min_length: 3,
                        max_length: 3,
                        placeholder: "Sim | Não",
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "letterContent",
                        label: "Escreva sua carta",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Em um dia, eu te vi na rua, foi quando...",
                        required: true
                    }
                ]
            }
        ]
    }

    transactionsReport = {
        title: "Transactions Report Center",
        custom_id: "transactionsModalReport",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "text",
                        label: "Explique o que aconteceu",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "Na data [xx/xx/xxxx xx:xx] está escrito undefined.",
                        required: true
                    }
                ]
            }
        ]
    }

    indicateLogomarca = {
        title: "Logomarca Indications",
        custom_id: "indicationsLogomarca",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "marca",
                        label: "Logos ou Marcas a serem adicionados",
                        style: 1,
                        min_length: 2,
                        max_length: 1020,
                        placeholder: "Toddy, Nescau, Coca-Cola...",
                        required: true
                    }
                ]
            }
        ]
    }

    reportBug = command => {
        return {
            title: "Bugs & Errors Reporting",
            custom_id: "BugModalReport",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "commandBuggued",
                            label: "Qual é o comando/sistema?",
                            placeholder: "Balance, Giveaway...",
                            style: 1,
                            max_length: 50,
                            value: command?.name || null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "bugTextInfo",
                            label: "O que aconteceu?",
                            style: 2,
                            min_length: 20,
                            max_length: 3900,
                            placeholder: "Quando tal recurso é usado acontece...",
                            required: true
                        }
                    ]
                }
            ]
        }
    }

    wordleGameNewTry = (messageId, length) => {
        return {
            title: "Wordle Game",
            custom_id: messageId,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'wordleGame',
                            label: "Nova Tentativa",
                            style: 1,
                            required: true,
                            min_length: length,
                            max_length: length,
                            placeholder: "Escreva aqui"
                        }
                    ]
                }
            ]
        }
    }

    editProfileModal = (title, job, niver, status) => {
        return {
            title: "Edit Profile Information",
            custom_id: "editProfile",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileTitle",
                            label: title ? "Alterar título" : "Qual seu título?",
                            style: 1,
                            min_length: 3,
                            max_length: 20,
                            placeholder: "Escrever novo título",
                            value: title?.length >= 5 && title?.length <= 20 ? title : null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileJob",
                            label: job ? 'Alterar Profissão' : 'Qual sua profissão?',
                            style: 1,
                            min_length: 5,
                            max_length: 30,
                            placeholder: "Estoquista, Gamer, Terapeuta...",
                            value: job?.length >= 5 ? job : null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileBirth",
                            label: niver ? 'Alterar Aniversário' : 'Digite seu aniversário',
                            style: 1,
                            min_length: 10,
                            max_length: 10,
                            placeholder: "26/06/1999",
                            value: niver?.length === 10 ? niver : null
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileStatus",
                            label: status ? 'Alterar Status' : 'Digite seu novo status',
                            style: 2,
                            min_length: 5,
                            max_length: 100,
                            placeholder: "No mundo da lua...",
                            value: status?.length >= 5 ? status : null
                        }
                    ]
                }
            ]
        }
    }

}