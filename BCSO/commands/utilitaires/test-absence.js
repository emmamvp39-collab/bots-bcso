const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-absence')
        .setDescription('Teste la détection d\'absence pour un agent spécifique.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addUserOption(option => 
            option.setName('cible')
                .setDescription('L\'agent à tester')
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        
        const cible = interaction.options.getUser('cible');
        const ABSENCE_CHANNEL_ID = '1492689033321775195';
        
        try {
            const channel = await client.channels.fetch(ABSENCE_CHANNEL_ID);
            if (!channel) return interaction.editReply("❌ Impossible de trouver le salon des absences.");

            const messages = await channel.messages.fetch({ limit: 100 });
            const userMessages = messages.filter(m => m.author.id === cible.id);

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
                    .setTitle('⚠️ [TEST] Alerte Rollcall ⚠️')
                    .setDescription(`L'agent ${cible} a été testé via commande.\nAucune trace de la template d'absence dans <#${ABSENCE_CHANNEL_ID}>.`)
                    .setTimestamp();

                await channel.send({ content: `${cible}`, embeds: [alertEmbed] });
                
                return interaction.editReply(`✅ Test terminé : ${cible} n'a pas mis la template. L'Embed a été envoyé dans le salon !`);
            }

            return interaction.editReply(`✅ Test terminé : ${cible} a bien posté la template. L'alerte a été ignorée.`);

        } catch (error) {
            console.error("❌ Erreur lors du test d'absence :", error);
            await interaction.editReply("⚠️ Une erreur est survenue pendant le test de l'agent.");
        }
    }
};