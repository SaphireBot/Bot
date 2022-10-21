import Mongoose from 'mongoose'
import('dotenv/config')
const { connect } = Mongoose

export default async () => {

    return connect(process.env.MONGODB_LINK_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => 'API - Database Connected')
        .catch(() => 'API - Database Connection Error')
}