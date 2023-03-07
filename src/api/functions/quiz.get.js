import { Database } from "../../classes/index.js"

export default async (req, res) => {

    if (req.headers?.authorization !== process.env.ROUTE_GET_DATA_FROM_DATABASE_PASSWORD)
        return res
            .send({ status: 401, response: "Authorization is not defined correctly." });

    const documents = await Database.Quiz.find()
    const docs = documents
        .map(doc => {
            const newDoc = Object.assign({}, doc)._doc
            newDoc._id = { "$oid": `${newDoc._id}` }
            return newDoc
        })

    return res
        .status(200)
        .send(docs)
}