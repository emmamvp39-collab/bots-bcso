const express = require('express');
const { WebhookClient } = require('discord.js');

module.exports = (client) => {
    const app = express();
    app.use(express.json());

    // Le port sur lequel ton bot va écouter
    const PORT = process.env.PORT || 3000; 

    // ⚠️ Remplace cette URL par celle du webhook de ton salon d'alerte, 
    // ou ajoute WEBHOOK_ALERTE_URL dans ton fichier .env
    const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ALERTE_URL || 'TON_URL_WEBHOOK_ICI' });
    const ABSENCE_CHANNEL_ID = '1492689033321775195';

    app.post('/api/check-absence', async (req, res) => {
        const { discordId } = req.body;

        if (!discordId) {
            return res.status(400).json({ error: 'discordId manquant' });
        }

        try {
            const channel = await client.channels.fetch(ABSENCE_CHANNEL_ID);
            if (!channel) return res.status(500).json({ error: 'Salon des absences introuvable' });

            // On récupère les 100 derniers messages du salon (tu pourras augmenter si besoin)
            const messages = await channel.messages.fetch({ limit: 100 });
            
            // On filtre pour ne garder que les messages de l'agent en question
            const userMessages = messages.filter(m => m.author.id === discordId);

            let hasPostedAbsence = false;

            // On vérifie si au moins un des messages contient ta template
            userMessages.forEach(msg => {
                const content = msg.content.toLowerCase();
                // On check la présence des mots clés de ta template
                if (content.includes('date abs') && content.includes('raison rp')) {
                    hasPostedAbsence = true;
                }
            });

            if (!hasPostedAbsence) {
                // Si aucune absence valide n'est trouvée, on déclenche le webhook
                await webhookClient.send({
                    content: `⚠️ **Alerte Rollcall** ⚠️\nL'agent <@${discordId}> a atteint 4 absences/retards non justifiés !\nAucune trace de la template dans <#${ABSENCE_CHANNEL_ID}>.`,
                    username: 'Alerte Rollcall',
                    avatarURL: client.user.displayAvatarURL() // Utilise l'avatar de ton bot
                });
                
                return res.status(200).json({ message: 'Alerte webhook envoyée avec succès.' });
            }

            return res.status(200).json({ message: 'Absence justifiée trouvée, tout est en ordre.' });

        } catch (error) {
            console.error("❌ Erreur lors de la vérification d'absence :", error);
            return res.status(500).json({ error: 'Erreur interne du bot' });
        }
    });

    app.listen(PORT, () => {
        console.log(`🌐 [API Bot] Serveur Express en écoute sur le port ${PORT}`);
    });
};