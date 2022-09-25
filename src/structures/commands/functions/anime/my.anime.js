import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { user } = interaction
    const allAnimes = await Database.animeIndications() || []

    if (!allAnimes || !allAnimes.length)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhuma indicação enviada/aprovada.`,
            ephemeral: true
        })

    const myAnimes = allAnimes.filter(anime => anime.authorId === user.id)

    if (!myAnimes || !myAnimes.length)
        return await interaction.reply({
            content: `${e.Deny} | Você não tem nenhuma indicação enviada/aprovada.`,
            ephemeral: true
        })

    const embeds = EmbedGenerator(myAnimes)
    let index = 0

    const msg = await interaction.reply({
        embeds: [embeds[0]],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Pra lá',
                    emoji: e.saphireLeft,
                    custom_id: 'left',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Pra cá',
                    emoji: e.saphireRight,
                    custom_id: 'right',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Deletar',
                    emoji: e.Trash,
                    custom_id: 'delete',
                    style: ButtonStyle.Danger
                },
                {
                    type: 2,
                    label: 'Cancelar',
                    custom_id: 'cancel',
                    style: ButtonStyle.Secondary
                }
            ]
        }],
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return collector.stop()

            if (customId === 'delete') return deleteAnime(int)

            if (customId === 'right') {
                index++
                if (index >= embeds.length) index = 0
            }

            if (customId === 'left') {
                index--
                if (index < 0) index = embeds.length - 1
            }

            return await int.update({ content: null, embeds: [embeds[index]] }).catch(() => { })
        })
        .on('end', async () => {

            const { embeds } = msg
            const embed = embeds[0]?.data

            embed.color = client.red
            embed.footer = { text: 'Comando encerrado.' }

            if (!embed)
                return await interaction.deleteReply().catch(() => { })

            return await interaction.editReply({
                content: null,
                embeds: [embed],
                components: []
            }).catch(() => { })

        })

    return

    function EmbedGenerator(myAnimes) {

        const embeds = []

        for (let i = 0; i < myAnimes.length; i++) {
            const anime = myAnimes[i]
            embeds.push({
                color: client.blue,
                title: `💭 Minhas indicações de animes - ${i + 1}/${allAnimes.length}`,
                description: `Você tem um total de **${myAnimes.length}** animes indicados.`,
                fields: [
                    {
                        name: '📺 Anime',
                        value: anime.name
                    },
                    {
                        name: '🧩 Gêneros',
                        value: anime.gender?.map(gen => `\`${gen}\``)?.join(', ') || '\`Not Found\`'
                    },
                    {
                        name: '🎞 Categorias',
                        value: anime.category?.map(cat => `\`${cat}\``)?.join(', ') || '\`Not Found\`'
                    },
                    {
                        name: '👥 Público Alvo',
                        value: anime.targetPublic?.map(pub => `\`${pub}\``)?.join(', ') || '\`Not Found\`'
                    }
                ]
            })
        }

        return embeds
    }

    async function deleteAnime(int) {

        const animeName = embeds[index].fields[0].value

        return Database.Indications.findOneAndDelete(
            { name: animeName }
        )
            .then(async result => {

                if (!result)
                    return int.deferUpdate({})

                embeds[index].color = client.red
                return await int.update({ embeds: [embeds[index]] }).catch(() => { })
            })
            .catch(async () => {
                return await interaction.editReply({
                    content: `${e.Deny} | Não foi possível deletar este anime.`,
                    embeds: [],
                    components: []
                }).catch(() => { })

            })

    }

}