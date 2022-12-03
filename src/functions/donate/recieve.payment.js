import mercadopago from 'mercadopago'
import { SaphireClient as client } from '../../classes/index.js'

export default requestBody => {
    
    if (!requestBody?.id || !requestBody.data?.id || !['payment.created', 'payment.updated'].includes(requestBody.action)) return

    return mercadopago.payment.get(requestBody.data.id)
        .then(payment => requestBody.action === 'payment.updated'
            ? client.emit('paymentUpdate', payment.body)
            : client.emit('paymentCreate', payment.body)
        )
        .catch(() => { })
}