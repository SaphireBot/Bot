import { ButtonStyle } from 'discord.js'

export default async (interaction, Database, client, e) => {

    const { options, user, channel } = interaction
    const inGameChat = await Database.Cache.General.get(`${client.shardId}.sequencyGame`) || []

    if (inGameChat?.includes(channel.id))
        return await interaction.reply({
            content: `${e.Info} | Já tem um Sequency Game rolando neste chat, espere ele terminar para você começar o seu, ok?`,
            ephemeral: true
        })

    Database.Cache.General.push(`${client.shardId}.sequencyGame`, channel.id)

    const numbers = options.getInteger('numbers')
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    const buttons = getButtons()
    const botoesEscolhidos = []
    let click = 0
    let msg;

    const allButtons = () => [
        buttons[0].components[0],
        buttons[0].components[1],
        buttons[0].components[2],
        buttons[0].components[3],
        buttons[0].components[4],
        buttons[1].components[0],
        buttons[1].components[1],
        buttons[1].components[2],
        buttons[1].components[3],
        buttons[1].components[4],
        buttons[2].components[0],
        buttons[2].components[1],
        buttons[2].components[2],
        buttons[2].components[3],
        buttons[2].components[4],
        buttons[3].components[0],
        buttons[3].components[1],
        buttons[3].components[2],
        buttons[3].components[3],
        buttons[3].components[4],
        buttons[4].components[0],
        buttons[4].components[1],
        buttons[4].components[2],
        buttons[4].components[3],
        buttons[4].components[4]
    ]

    randomizeOptions()

    msg = await interaction.reply({
        content: `${e.Info} | Clique com calma nos botões para não estragar o jogo.`,
        components: buttons,
        fetchReply: true
    })

    setTimeout(() => restartButtons(), 3500)

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 30000
    })
        .on('collect', int => {

            const { customId } = int
            int.deferUpdate().catch(() => { })

            if (customId !== botoesEscolhidos[click]) {
                collector.stop()
                return disableAllButtons()
            }

            const allButtonsCommand = allButtons()
            const button = allButtonsCommand.find(b => b.custom_id === customId)
            button.style = ButtonStyle.Success
            button.emoji = emojis[click]
            click++

            if (click >= botoesEscolhidos.length) {
                collector.stop()
                return disableAllButtons(true)
            }

            return msg.edit({ components: buttons })
        })
        .on('end', async (_, r) => {
            await Database.Cache.General.pull(`${client.shardId}.sequencyGame`, channelId => channelId == channel.id)
            if (r === 'idle') return disableAllButtons(null)
            return
        })

    function getButtons() {

        const defaultEmoji = '❔'

        /*
          A1 A2 A3 A4 A5 
          B1 B2 B3 B4 B5 
          C1 C2 C3 C4 C5 
          D1 D2 D3 D4 D5 
          E1 E2 E3 E4 E5 
         */

        const aButtons = { type: 1, components: [] }
        const bButtons = { type: 1, components: [] }
        const cButtons = { type: 1, components: [] }
        const dButtons = { type: 1, components: [] }
        const eButtons = { type: 1, components: [] }

        for (let i = 1; i < 6; i++) {
            aButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `a${i}`, style: ButtonStyle.Secondary, disabled: true })
            bButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `b${i}`, style: ButtonStyle.Secondary, disabled: true })
            cButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `c${i}`, style: ButtonStyle.Secondary, disabled: true })
            dButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `d${i}`, style: ButtonStyle.Secondary, disabled: true })
            eButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `e${i}`, style: ButtonStyle.Secondary, disabled: true })
        }

        return [aButtons, bButtons, cButtons, dButtons, eButtons]
    }

    function randomizeOptions() {

        const allButtonsCommand = allButtons()
        const randomButtons = allButtonsCommand.random(numbers)
        let i = 0

        for (let button of randomButtons) {
            allButtonsCommand.find(b => b.custom_id === button.custom_id)
            button.emoji = emojis[i]
            botoesEscolhidos.push(button.custom_id)
            i++
        }
    }

    function restartButtons() {

        const allButtonsCommand = allButtons()
        for (let button of allButtonsCommand) {
            button.disabled = false
            if (button.emoji !== '❔')
                button.emoji = '❔'
        }

        return msg.edit({ components: buttons }).catch(() => { })
    }

    function disableAllButtons(win) {

        const allButtonsCommand = allButtons()
        for (let button of allButtonsCommand) {
            button.disabled = true

            if (botoesEscolhidos.includes(button.custom_id)) {
                const index = botoesEscolhidos.findIndex(d => d === button.custom_id)
                button.emoji = emojis[index]

                if (button.style !== ButtonStyle.Success)
                    button.style = ButtonStyle.Danger

            } else {
                button.style = win ? ButtonStyle.Primary : ButtonStyle.Danger
                button.emoji = win ? null : '❌'
                button.label = win ? 'GG!' : null
            }
        }

        const finishMessage = win
            ? `${e.Check} | Boa! Você acertou uma sequência de ${numbers} números.`
            : `${e.Deny} | Que pena! Você não conseguiu acertar a sequência de ${numbers} números.`

        if (win === null)
            return msg.edit({
                content: `${e.Deny} | Sequency Game cancelado por falta de resposta.`,
                components: buttons
            })

        return msg.edit({
            content: finishMessage,
            components: buttons
        }).catch(() => { })
    }

}