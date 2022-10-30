export default new class Modals {

    get modals() {
        return { ...this }
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
                        placeholder: `${user.tag} possui ${userMoney} Safiras`,
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
                } // MAX: 5 Fields
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
            } // MAX: 5 Fields
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
                } // MAX: 5 Fields
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

    reportLetter = {
        title: "Report Letter Content",
        custom_id: "lettersReport",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "letterId",
                        label: "Informe o ID da carta",
                        style: 1,
                        max_length: 7,
                        max_length: 7,
                        placeholder: "ABC1234",
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
                        label: "Qual é o motivo da sua denúncia?",
                        style: 2,
                        min_length: 10,
                        max_length: 1024,
                        placeholder: "O autor da carta me xingou...",
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
            } // MAX: 5 Fields
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
            } // MAX: 5 Fields
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
                }, // MAX: 5 Fields
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