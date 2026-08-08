const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // On vérifie que c'est bien un bouton
        if (!interaction.isButton()) return;

        const { customId, user, channel } = interaction;

        // Gestion du bouton "Prendre en charge"
        if (customId === 'claim_ticket') {
            const claimEmbed = new EmbedBuilder()
                .setColor(0x00FF00) // Vert
                .setDescription(`✅ **${user.username}** a pris en charge la demande.`);
            
            // On envoie le message et on désactive/supprime le bouton pour ne pas qu'on clique deux fois
            await interaction.reply({ embeds: [claimEmbed] });
            
            // Met à jour le nom du salon pour indiquer qu'il est pris en charge (optionnel mais propre)
            channel.setName(`pris-${channel.name}`).catch(console.error);

            // On retire le bouton 'Prendre en charge' du message d'origine
            const message = interaction.message;
            const row = message.components[0];
            const updatedComponents = row.components.filter(c => c.customId !== 'claim_ticket');
            
            // Si on a encore des boutons (ex: Clôturer), on remet la ligne, sinon on l'enlève
            const newActionRow = updatedComponents.length > 0 ? [{ type: 1, components: updatedComponents }] : [];
            await message.edit({ components: newActionRow });
        }

        // Gestion du bouton "Clôturer le ticket"
        if (customId === 'close_ticket') {
            const closeEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Rouge
                .setDescription(`🔒 **${user.username}** a demandé la fermeture du ticket. Le salon sera supprimé dans 5 secondes.`);

            await interaction.reply({ embeds: [closeEmbed] });

            // Supprime le salon après un petit délai
            setTimeout(() => {
                channel.delete().catch(console.error);
            }, 5000);
        }
    },
};