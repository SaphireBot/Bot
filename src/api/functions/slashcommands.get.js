import { SaphireClient } from "../../classes/index.js";

export default async (req, res) => {
    if (req.headers?.authorization !== process.env.COMMAND_ACCESS)
        return res
            .send({
                status: 401,
                response: "Authorization is not defined correctly."
            });

    return res
        .send(SaphireClient?.slashCommandsData || [])

}