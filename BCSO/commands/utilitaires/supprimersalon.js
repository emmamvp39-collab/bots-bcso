const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('supprimersalon')
        .setDescription('Supprime un salon.')
        .addChannelOption(option => 
            option.setName('cible')
                .setDescription('Le salon à supprimer (laisser vide pour supprimer le salon ACTUEL)')
                .setRequired(false)
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Restriction par ID Discord
        if (interaction.user.id !== '1247264549489610897') {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // 2. Récupération du salon (celui précisé, sinon le salon actuel)
        const salonASupprimer = interaction.options.getChannel('cible') || interaction.channel;

        try {
            // 3. Si on supprime un autre salon, on peut envoyer une confirmation ici
            if (salonASupprimer.id !== interaction.channelId) {
                await interaction.reply({ 
                    content: `✅ Suppression du salon **${salonASupprimer.name}** en cours...`, 
                    ephemeral: true 
                });
            }

            // 4. Suppression
            await salonASupprimer.delete();

        } catch (error) {
            console.error("❌ Erreur lors de la suppression du salon :", error);
            
            // On gère l'erreur différemment selon si l'interaction a déjà eu une réponse ou non
            const messageErreur = "⚠️ Une erreur est survenue lors de la suppression. Vérifiez mes permissions.";
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: messageErreur });
            } else {
                await interaction.reply({ content: messageErreur, ephemeral: true });
            }
        }
    }
};