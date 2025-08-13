
import type { WhatsappConfig } from '../types';

interface NotificationResult {
  success: boolean;
  error?: string;
}

export const sendWhatsappNotification = async (
    config: WhatsappConfig,
    message: string,
    phoneNumber?: string
): Promise<NotificationResult> => {
    const { endpoint, key, session, chatId } = config;

    if (!endpoint || !key || !session) {
        return { success: false, error: 'A configuração da API do WhatsApp está incompleta (Endpoint, Key, Session). Por favor, verifique em Configurações.' };
    }
    
    let recipientId: string;

    if (phoneNumber) {
        const cleanedPhone = phoneNumber.replace(/\D/g, '');
        recipientId = `${cleanedPhone}@c.us`;
    } else if (chatId) {
        recipientId = chatId;
    } else {
        return { success: false, error: 'Destinatário não definido. Forneça um número de telefone ou configure um Chat ID padrão.' };
    }

    // The previous attempt using 'X-Api-Key' resulted in a 401 error.
    // This attempt uses the standard 'Authorization' header with a Bearer token,
    // which might be required by this specific API deployment.
    const url = `${endpoint.replace(/\/$/, '')}/api/sendText`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chatId: recipientId,
                text: message,
                session: session
            })
        });

        if (!response.ok) {
            let errorBody = 'O servidor respondeu com um erro.';
            try {
                const errorData = await response.json();
                errorBody = `Detalhes: ${JSON.stringify(errorData)}`;
            } catch (e) {
                try {
                    errorBody = await response.text();
                } catch(e2) {
                    // Ignore
                }
            }
            throw new Error(`Erro de HTTP ${response.status}. ${errorBody}`);
        }

        return { success: true };

    } catch (error) {
        console.error('Erro ao enviar notificação via WhatsApp:', error);
        const errorMessage = `Falha ao enviar notificação. Verifique a configuração da API e se o servidor permite requisições de origem cruzada (CORS). ${error}`;
        return { success: false, error: errorMessage };
    }
};
