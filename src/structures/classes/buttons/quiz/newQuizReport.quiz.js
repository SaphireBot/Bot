import Quiz from "../../../../classes/games/Quiz.js";
import { Database, SaphireClient as client } from "../../../../classes/index.js";
import { CodeGenerator } from "../../../../functions/plugins/plugins.js";
import { Emojis as e } from "../../../../util/util.js";

// Modal Interaction
export default async interaction => {

    const { user, guild, fields, channel, customId } = interaction
    const customIdData = JSON.parse(customId)
    const questionId = customIdData.id
    const content = fields.getTextInputValue('content')
    const webhookUrl = await Quiz.getWebhookUrl(channel) || null

    const dataSave = {
        reportId: CodeGenerator(10),
        userId: user.id,
        guildId: guild.id,
        questionId,
        webhookUrl,
        content
    }

    Quiz.reports.push(dataSave)
    await Database.Client.updateOne(
        { id: client.user.id },
        {
            $push: {
                QuizQuestionsReports: {
                    $each: [dataSave]
                }
            }
        }
    )

    return await interaction.reply({
        embeds: [{
            color: client.green,
            title: `${e.CheckV} | O seu reporte foi salvo com sucesso.`,
            description: `\`\`\`txt\n${content}\n\`\`\``,
            footer: {
                text: `Report ID: ${dataSave.reportId}`
            }
        }],
        ephemeral: true
    })
}