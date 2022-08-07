import mercadopago from 'mercadopago'
import newCreate from './create.payment.js'
import newUpdate from './update.payment.js'
import { Database } from '../../classes/index.js'

export default async requestBody => {

    if (!requestBody.id || !requestBody.data?.id || !['payment.created', 'payment.updated'].includes(requestBody.action)) return

    return mercadopago.payment.get(requestBody.data.id)
        .then(payment => requestBody.action === 'payment.updated'
            ? newUpdate(payment.body)
            : newCreate(payment.body))
        .catch(() => { })
}