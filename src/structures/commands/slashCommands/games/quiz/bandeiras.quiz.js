import { Emojis as e } from '../../../../../util/util.js'
import FlagGame from './../bandeiras/manager.bandeiras.js'
import { SaphireClient as client, Database } from '../../../../../classes/index.js'

export default async interaction => {

    const { options, user } = interaction
    const option = options.getString('options')

    if (option === 'play')
        return new FlagGame(interaction).register()

    if (option === 'credits') {

        const rody = await client.users.fetch(Database.Names.Rody).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Rody - \`${Database.Names.Rody}\``)
        const lereo = await client.users.fetch(Database.Names.Lereo).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Lereo - \`${Database.Names.Lereo}\``)
        const moana = await client.users.fetch(Database.Names.Moana).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Moana - \`${Database.Names.Moana}\``)
        const andre = await client.users.fetch(Database.Names.Andre).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Andre - \`${Database.Names.Andre}\``)
        const pandinho = await client.users.fetch(Database.Names.Pandinho).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Pandinho - \`${Database.Names.Pandinho}\``)
        const gorniaky = await client.users.fetch(Database.Names.Gorniaky).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Gorniaky - \`${Database.Names.Gorniaky}\``)
        const mari = await client.users.fetch(Database.Names.Mari).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Mari - \`${Database.Names.Mari}\``)

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: '📝 Créditos aos envolvidos',
                description: 'Pessoas que fizeram este comando acontecer',
                fields: [
                    {
                        name: '🫡 Supervisão Geral',
                        value: `${mari}`
                    },
                    {
                        name: '⚙️ Código Fonte',
                        value: `${rody}`
                    },
                    {
                        name: '👨‍💻 Suporte ao Código Fonte',
                        value: `${andre}\n${pandinho}\n${gorniaky}`
                    },
                    {
                        name: '🗺️ Coleta e Disponibilidade de Bandeiras',
                        value: `${lereo}\n${moana}`
                    }
                ],
                footer: {
                    text: '❤️ Powered By: Com muito carinho'
                }
            }]
        })
    }

    if (option === 'points') {

        const userData = await Database.User.findOne({ id: user.id }, 'GamingCount.FlagCount')
        const points = userData?.GamingCount?.FlagCount || 0
        return await interaction.reply({
            content: `${e.Check} | Você tem exatamente **${points} acertos** no Bandeira Quiz.`
        })
    }

    return await interaction.reply({
        content: `${e.Deny} | Nenhuma função foi encontrada. #165651`,
        ephemeral: true
    })
}