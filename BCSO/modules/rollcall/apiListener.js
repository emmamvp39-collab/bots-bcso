const express = require('express');
const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
    const app = express();
    app.use(express.json());

    const PORT = process.env.PORT || 3000; 
    const ABSENCE_CHANNEL_ID = '1492689033321775195';
    const ALERT_CHANNEL_ID = '1530946442359996546';   

    app.post('/api/check-absence', async (req, res) => {
        const { discordId } = req.body;

        if (!discordId) return res.status(400).json({ error: 'discordId manquant' });

        try {
            const absenceChannel = await client.channels.fetch(ABSENCE_CHANNEL_ID);
            const alertChannel = await client.channels.fetch(ALERT_CHANNEL_ID);
            
            if (!absenceChannel || !alertChannel) return res.status(500).json({ error: 'Un des salons est introuvable' });

            const messages = await absenceChannel.messages.fetch({ limit: 100 });
            const userMessages = messages.filter(m => m.author.id === discordId);

            let hasPostedAbsence = false;

            userMessages.forEach(msg => {
                const content = msg.content.toLowerCase();
                if (content.includes('date abs') && content.includes('raison rp')) {
                    hasPostedAbsence = true;
                }
            });

            if (!hasPostedAbsence) {
                const alertEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⚠️ Alerte Rollcall ⚠️')
                    .setDescription(`L'agent <@${discordId}> a atteint 4 absences ou non-réactions non justifiées !\nAucune trace de la template d'absence dans <#${ABSENCE_CHANNEL_ID}>.`)
                    .setTimestamp();

                await alertChannel.send({ content: `<@${discordId}>`, embeds: [alertEmbed] });
                return res.status(200).json({ message: 'Alerte Embed envoyée avec succès.' });
            }

            return res.status(200).json({ message: 'Absence justifiée trouvée, tout est en ordre.' });

        } catch (error) {
            console.error("❌ Erreur API bot :", error);
            return res.status(500).json({ error: 'Erreur interne' });
        }
    });

    app.listen(PORT, () => console.log(`🌐 [API Bot] Serveur Express en écoute sur le port ${PORT}`));
};