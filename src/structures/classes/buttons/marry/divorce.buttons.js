import { Database, SaphireClient as client } from "../../../../classes/index.js";
import { setTimeout as sleep } from "node:timers/promises";
import { ButtonInteraction } from "discord.js";
import { Emojis as e } from "../../../../util/util.js";
import { socket } from "../../../../websocket/websocket.js";

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, message } = interaction

    if (user.id !== message.interaction?.user?.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, beleza?`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Autenticando dados...`, components: [] }).catch(() => { })
    await sleep(2000)

    const userData = await Database.getUser(user.id)

    if ((userData?.Balance || 0) < 100000)
        return interaction.editReply({
            content: `${e.Animated.SaphireReading} | Eu vi aqui que você não tem 100.000 Safiras para efetuar o divórcio.`,
        }).catch(() => { })

    if (!userData?.Perfil?.Marry?.Conjugate)
        return interaction.editReply({
            content: `${e.Deny} | Você não está em nenhum relacionamento, não tem como se divorciar, né não?`
        }).catch(() => { })

    const conjuge = await client.users.fetch(userData?.Perfil?.Marry?.Conjugate).catch(() => null)
    const conjugateData = await Database.getUser(userData?.Perfil?.Marry?.Conjugate)

    if (!conjuge)
        await interaction.editReply({ content: `${e.DenyX} | Autenticando dados...\n${e.DenyX} | Não foi possível obter os dados de seu cônjuge.` }).catch(() => { })

    if (!conjugateData?.Perfil?.Marry?.Conjugate) {
        await interaction.editReply({ content: `${e.CheckV} | Dados autenticados.\n${e.Loading} | Seu cônjuge não está casado com ninguém, corrigindo seu perfil gratuitamente...` }).catch(() => { })
        await sleep(2000)
        return fixProfile()
    }

    await interaction.editReply({
        content: `${e.CheckV} | Dados autenticados.\n${e.Loading} | Divórcio validado, salvando alterações em ambos os perfis...`,
        components: []
    }).catch(() => { })

    const transaction = {
        time: `${Date.format(0, true)}`,
        data: `${e.loss} Perdeu 100000 Safiras em um divórcio.`
    }

    socket?.send({
        type: "transactions",
        transactionsData: { value: 100000, userId: user.id, transaction }
    })

    await Database.User.findOneAndUpdate(
        { id: user.id },
        {
            $inc: { Balance: -100000 },
            $unset: { "Perfil.Marry": true },
            $push: {
                Transactions: {
                    $each: [transaction],
                    $position: 0
                }
            }
        },
        { new: true, upsert: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    await Database.User.findOneAndUpdate(
        { id: userData?.Perfil?.Marry?.Conjugate },
        { $unset: { "Perfil.Marry": true } },
        { new: true, upsert: true }
    )
        .then(doc => Database.saveUserCache(doc?.id, doc))

    await sleep(2000)
    await interaction.editReply({
        content: `${e.CheckV} | Dados autenticados.\n${e.CheckV} | Divórcio concluído e dados salvos.\n${e.Loading} | Enviando notificações do divórcio para os dois...`
    }).catch(() => { })

    const content = `${e.Animated.SaphireReading} | ${user} colocou um fim ao seu relacionamento. Divórcio efetuado em ${Date.complete(Date.now())}`
    await user.send({ content }).catch(() => { })
    await conjuge.send({ content }).catch(() => { })
    await sleep(2000)

    return interaction.editReply({
        content: `${e.CheckV} | Dados autenticados.\n${e.CheckV} | Divórcio concluído e dados salvos.\n${e.CheckV} | Notificações enviadas.\n${e.CheckV} | Divórcio efetuado com sucesso.`
    }).catch(() => { })

    async function fixProfile() {
        await Database.User.findOneAndUpdate(
            { id: user.id },
            { $unset: { "Perfil.Marry": true } },
            { new: true, upsert: true }
        )
            .then(doc => Database.saveUserCache(doc?.id, doc))

        return interaction.editReply({
            content: `${e.CheckV} | Dados autenticados.\n${e.CheckV} | Seu cônjuge não está casado com ninguém, perfil corrigido gratuitamente.`
        }).catch(() => { })

    }
}