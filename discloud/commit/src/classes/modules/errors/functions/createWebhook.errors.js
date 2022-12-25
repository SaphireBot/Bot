export default
    async (channel, clientId, ErrorWebhookProfileIcon) => {
        return channel.createWebhook({
            name: clientId,
            avatar: ErrorWebhookProfileIcon,
            reason: 'Nenhuma webhook encontrada'
        })
            .catch(() => null)
    }