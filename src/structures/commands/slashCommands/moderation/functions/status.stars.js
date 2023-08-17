import { SaphireClient as client } from "../../../../../classes/index.js"

export default async ({ interaction, e, guildData }) => {

    const { options, user } = interaction

    const method = {
        sended: sended,
        credits: credits,
        myStars: myStars,
        stats: stats
    }[options.getString('method')]

    if (method) return method()

    return await interaction.reply({
        content: `${e.Deny} | Sub Comando de Sub Função não encontrado. #1254`
    })

    async function stats() {
        return await interaction.reply({
            content: `${e.Info} | Neste servidor, uma mensagem tem que receber **${guildData?.Stars?.limit} reações** para que a mensagem seja enviada para o canal <#${guildData?.Stars?.channel}>`
        })
    }

    async function myStars() {
        const sendedStars = guildData?.Stars?.sended || []
        const myStars = sendedStars.filter(data => data.userId === user.id)

        if (!myStars.length)
            return await interaction.reply({
                content: `${e.Deny} | Você não tem nenhuma estrela.`,
                ephemeral: true
            })

        return await interaction.reply({
            content: `⭐ | Você tem um total de ${myStars.length} estrelas enviadas neste servidor.`
        })
    }

    async function sended() {
        const sendedStars = guildData?.Stars?.sended || []
        return await interaction.reply({
            content: `⭐ | Este servidor tem um total de ${sendedStars.length} estrelas enviadas.`
        })
    }

    async function credits() {

        const NaNa = await client.users.fetch('607812142090944523')
            .then(u => `${u.username} - \`607812142090944523\``)
            .catch(() => 'Not Found - `607812142090944523`')

        const Rody = await client.users.fetch('451619591320371213')
            .then(u => `${u.username} - \`451619591320371213\``)
            .catch(() => 'Not Found - `451619591320371213`')

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: '❤️ Créditos de Criação do comando /stars',
                fields: [
                    {
                        name: '💡 Sugestão e Idealização',
                        value: NaNa
                    },
                    {
                        name: `${e.Gear} Código Fonte`,
                        value: Rody
                    },
                    {
                        name: '⭐ Inspiração',
                        value: `Bot [Shiro](https://discord.com/api/oauth2/authorize?client_id=572413282653306901&permissions=311318408311&scope=applications.commands%20bot)`
                    }
                ]
            }]
        })
    }

}