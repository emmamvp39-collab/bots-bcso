const { SlashCommandBuilder, WebhookClient, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-absence')
        .setDescription('Teste la détection d\'absence et le webhook pour un agent.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => 
            option.setName('agent')
                .setDescription('L\'agent à tester')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        
        const user = interaction.options.getUser('agent');
        const ABSENCE_CHANNEL_ID = '1492689033321775195';
        
        try {
            const channel = await client.channels.fetch(ABSENCE_CHANNEL_ID);
            if (!channel) return interaction.editReply("❌ Salon des absences introuvable.");

            const messages = await channel.messages.fetch({ limit: 100 });
            const userMessages = messages.filter(m => m.author.id === user.id);

            let hasPostedAbsence = false;

            userMessages.forEach(msg => {
                const content = msg.content.toLowerCase();
                if (content.includes('date abs') && content.includes('raison rp')) {
                    hasPostedAbsence = true;
                }
            });

            if (!hasPostedAbsence) {
                // ⚠️ Pense bien à remplacer l'URL du webhook ici ou utiliser ton .env
                const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ALERTE_URL || 'TON_URL_WEBHOOK_ICI' });
                await webhookClient.send({
                    content: `⚠️ **[TEST MANUEL] Alerte Rollcall** ⚠️\nL'agent <@${user.id}> a été testé via commande.\nAucune trace de la template dans <#${ABSENCE_CHANNEL_ID}>.`,
                    username: 'Alerte Rollcall (Test)',
                    avatarURL: client.user.displayAvatarURL()
                });
                
                return interaction.editReply(`✅ Test terminé : <@${user.id}> n'a **pas** la template. Le webhook de test vient de partir !`);
            }

            return interaction.editReply(`✅ Test terminé : <@${user.id}> a bien posté la template. **Aucun** webhook n'a été déclenché.`);

        } catch (error) {
            console.error("❌ Erreur test-absence :", error);
            return interaction.editReply("⚠️ Une erreur est survenue pendant le test du salon.");
        }
    }
};