const express = require('express');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const app = express();
    app.use(express.json());

    const PORT = process.env.PORT || 3000; 
    const ABSENCE_CHANNEL_ID = '1492689033321775195';
    
    // Chemin vers le fichier des pass
    const passesFile = path.join(__dirname, '../../data/passes.json');

    app.post('/api/check-absence', async (req, res) => {
        const { discordId } = req.body;

        if (!discordId) return res.status(400).json({ error: 'discordId manquant' });

        // Vérification du pass d'immunité
        if (fs.existsSync(passesFile)) {
            const passes = JSON.parse(fs.readFileSync(passesFile, 'utf8'));
            if (passes.includes(discordId)) {
                console.log(`🛡️ [Immunité] Vérification ignorée pour l'ID ${discordId} (Pass actif)`);
                return res.status(200).json({ message: 'Agent immunisé.' });
            }
        }

        try {
            const channel = await client.channels.fetch(ABSENCE_CHANNEL_ID);
            if (!channel) return res.status(500).json({ error: 'Salon des absences introuvable' });

            const messages = await channel.messages.fetch({ limit: 100 });
            const userMessages = messages.filter(m => m.author.id === discordId);

            let hasPostedAbsence = false;

            userMessages.forEach(msg => {
                const content = msg.content.toLowerCase();
                if (content.includes('date abs') && content.includes('raison rp')) {
                    hasPostedAbsence = true;
                }
            });

            if (!hasPostedAbsence) {
                // Création de l'Embed
                const alertEmbed = new EmbedBuilder()
                    .setColor('#ff0000') // Rouge pour l'alerte
                    .setTitle('⚠️ Alerte Rollcall ⚠️')
                    .setDescription(`L'agent <@${discordId}> a atteint 4 absences ou non-réactions non justifiées !\nAucune trace de la template d'absence trouvée.`)
                    .setTimestamp();

                // Envoi direct dans le salon avec mention
                await channel.send({ content: `<@${discordId}>`, embeds: [alertEmbed] });
                
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