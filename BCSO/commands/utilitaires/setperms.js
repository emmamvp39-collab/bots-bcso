const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setperms')
        .setDescription('Modifie les permissions d\'un membre ou rôle via l\'ID du salon.')
        .addStringOption(option => 
            option.setName('id_salon')
                .setDescription('Colle l\'ID du salon ici (Clic droit -> Copier l\'identifiant)')
                .setRequired(true)
        )
        .addMentionableOption(option => 
            option.setName('cible')
                .setDescription('Le membre ou le rôle à modifier (@nom)')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('voir_salon')
                .setDescription('Peut voir ce salon ? (True = Oui, False = Non)')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('envoyer_messages')
                .setDescription('Peut écrire dans ce salon ? (True = Oui, False = Non)')
                .setRequired(false)
        ),
        
    async execute(interaction, client) {
        if (interaction.user.id !== '1247264549489610897') return interaction.reply({ content: "❌ Refusé.", ephemeral: true });

        const salonId = interaction.options.getString('id_salon');
        const cible = interaction.options.getMentionable('cible');
        const voirSalon = interaction.options.getBoolean('voir_salon');
        const envoyerMessages = interaction.options.getBoolean('envoyer_messages');

        // Récupération du salon via son ID
        const salon = interaction.guild.channels.cache.get(salonId) || await interaction.guild.channels.fetch(salonId).catch(() => null);

        if (!salon) {
            return interaction.reply({ content: "❌ Impossible de trouver un salon avec cet ID.", ephemeral: true });
        }

        const permsAChanger = {};
        if (voirSalon !== null) permsAChanger.ViewChannel = voirSalon;
        if (envoyerMessages !== null) permsAChanger.SendMessages = envoyerMessages;

        if (Object.keys(permsAChanger).length === 0) {
            return interaction.reply({ content: "⚠️ Tu dois choisir au moins une permission à modifier.", ephemeral: true });
        }

        try {
            await salon.permissionOverwrites.edit(cible.id, permsAChanger);
            await interaction.reply({ content: `✅ Permissions mises à jour pour **${cible}** dans le salon <#${salon.id}>.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "⚠️ Erreur de permissions. Mon rôle bot doit être plus haut que la cible.", ephemeral: true });
        }
    }
};