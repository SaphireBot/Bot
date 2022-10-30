import {
    SaphireClient as client
} from "../../../../../classes/index.js"

export default async interaction => {

    const guild = await client.getGuild(interaction.guild.id, true)
    if (!guild) return
    // const c = await guild.fetchIntegrations()
    // const Integration = c.filter(data => data.application.id === client.user.id).first()

    console.log(client.shard)

}