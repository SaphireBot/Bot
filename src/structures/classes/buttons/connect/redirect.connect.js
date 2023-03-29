import { ButtonStyle } from "discord.js"
import { SaphireClient as client, Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import play from "./play.connect.js"

// Button Interaction
export default ({ interaction, user, message }, commandData) => {

    const { src, userId } = commandData

    const execute = { cancel, init, play, info }[src]

    if (!execute)
        return interaction.reply({
            content: `${e.Deny} | Sub-função não encontrada. #15687154`,
            ephemeral: true
        })

    return execute(interaction, commandData)

    function cancel() {

        if (![userId, message.interaction.user.id].includes(user.id))
            return interaction.reply({
                content: `${e.DenyX} | Eeepa, você não usou o comando e também não foi desafiado, né?`,
                ephemeral: true
            })

        Database.Cache.Connect.delete(message.id)
        return interaction.update({
            content: `${e.Deny} | ${interaction.user} cancelou o desafio Connect4.`,
            components: []
        }).catch(() => { })
    }

    async function init() {

        if (userId !== user.id)
            return interaction.reply({
                content: `${e.DenyX} | Uuuh, só quem foi desafiado pode aceitar o desafio, né?`,
                ephemeral: true
            })

        await interaction.update({ content: `${e.Loading} | Iniciando e configurando o Connect4.`, embeds: [], components: [] }).catch(() => { })

        const lines = new Array(7).fill(new Array(7).fill(e.white))
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"]
        const playNow = [message.interaction.user.id, userId].random()
        const components = [{ type: 1, components: [] }, { type: 1, components: [] }]

        for (let i = 0; i <= 3; i++)
            components[0].components.push({
                type: 2,
                emoji: emojis[i],
                custom_id: JSON.stringify({ c: 'connect', src: 'play', i: i }),
                style: ButtonStyle.Secondary
            })

        for (let i = 4; i <= 6; i++)
            components[1].components.push({
                type: 2,
                emoji: emojis[i],
                custom_id: JSON.stringify({ c: 'connect', src: 'play', i: i }),
                style: ButtonStyle.Secondary
            })

        const emojiPlayer = {
            [
                playNow == message.interaction.user.id
                    ? userId
                    : message.interaction.user.id
            ]: e.red,
            [
                playNow == message.interaction.user.id
                    ? message.interaction.user.id
                    : userId
            ]: e.yellow
        }

        await Database.Cache.Connect.set(message.id, {
            players: [message.interaction.user.id, userId],
            lines: lines, playNow, emojiPlayer,
            history: {
                [message.interaction.user.id]: [],
                [userId]: []
            }
        })

        return message.edit({
            content: `${e.Loading} Aguardando <@${playNow}> ${emojiPlayer[playNow]} fazer sua jogada`,
            embeds: [{
                color: client.blue,
                title: `${client.user.username}'s Connect4`,
                fields: [
                    {
                        name: '🕳️ Tabuleiro',
                        value: lines.map(line => line.join('|')).join('\n') + `\n${emojis.join('|')}`
                    },
                    {
                        name: '📝 Histórico de Jogadas',
                        value: 'Nenhum jogada por enquanto'
                    }
                ]
            }],
            components,
            ephemeral: true
        })
            .catch(err => {
                if (err.code == 10062) return interaction.channel.send({ connect: `${e.cry} | ${interaction.user}, o Discord não entregou todos os dados necessário. Pode clicar no botão mais uma vez?` })
                Database.Cache.Connect.delete(message.id)
                message.delete().catch(() => { })
                return interaction.channel.send({ content: `${e.cry} | Erro ao iniciar o jogo\n${e.bug} | \`${err}\`` })
            })
    }

    function info() {
        return interaction.reply({
            embeds: [{
                color: client.blue,
                title: '🟡 Connect4 🔴',
                image: {
                    url: 'https://media.discordapp.net/attachments/893361065084198954/1090442596251357204/connect4.png?width=421&height=468'
                },
                fields: [
                    {
                        name: '🏳️ Objetivo',
                        value: 'O objetivo do jogo Connect4 é colocar 4 pedras em linha (quer horizontal, vertical ou diagonalmente). O primeiro jogador, que atingir este objetivo, ganha o jogo. '
                    },
                    {
                        name: '🕳️ Tabuleiro',
                        value: 'Connect4 é jogado num tabuleiro quadrado de 6x6, 6x7, 7x7 ou 8x8. A Saphire segue o padrão 7x7 . A cada jogador é atribuída uma cor, Amarelo e Vermelho.'
                    },
                    {
                        name: `${e.QuestionMark} Como Jogar`,
                        value: 'O Jogo começa com o tabuleiro vazio.\nOs jogadores jogam alternadamente, começando a partida a partir do jogador com as pedras amarelas.\n Em cada turno, o jogador deixa cair uma pedra da sua cor ao longo de uma das colunas do tabuleiro. A pedra colocada cai até chegar ao fundo do tabuleiro ou ficar sobre uma outra pedra, independentemente da cor'
                    }
                ]
            }],
            ephemeral: true
        })
    }

}