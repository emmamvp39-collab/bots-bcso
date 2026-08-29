const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setperms')
        .setDescription('Modifie les permissions d\'un rôle dans un salon spécifique.')
        .addChannelOption(option => 
            option.setName('salon')
                .setDescription('Le salon dont tu veux modifier les permissions')
                .setRequired(true)
        )
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Le rôle concerné par la modification')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option.setName('voir_salon')
                .setDescription('Le rôle peut-il voir ce salon ? (True = Oui, False = Non)')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('envoyer_messages')
                .setDescription('Le rôle peut-il écrire dans ce salon ? (True = Oui, False = Non)')
                .setRequired(false)
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Restriction stricte à ton ID Discord
        if (interaction.user.id !== '1247264549489610897') {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // 2. Récupération du salon et du rôle
        const salon = interaction.options.getChannel('salon');
        const role = interaction.options.getRole('role');
        
        // 3. Récupération des choix booléens (renvoie null si tu n'as rien sélectionné)
        const voirSalon = interaction.options.getBoolean('voir_salon');
        const envoyerMessages = interaction.options.getBoolean('envoyer_messages');

        // 4. Construction de l'objet des permissions à modifier
        const permsAChanger = {};
        
        if (voirSalon !== null) permsAChanger.ViewChannel = voirSalon;
        if (envoyerMessages !== null) permsAChanger.SendMessages = envoyerMessages;

        // Si aucune permission n'est sélectionnée dans les options
        if (Object.keys(permsAChanger).length === 0) {
            return interaction.reply({
                content: "⚠️ Tu dois choisir au moins une permission à modifier (voir_salon ou envoyer_messages) dans les options de la commande.",
                ephemeral: true
            });
        }

        try {
            // 5. Application des nouvelles permissions en utilisant .edit() pour ne pas écraser les autres
            await salon.permissionOverwrites.edit(role.id, permsAChanger);

            await interaction.reply({ 
                content: `✅ Permissions mises à jour avec succès pour le rôle **${role.name}** dans le salon ${salon}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("❌ Erreur lors de la modification des permissions :", error);
            await interaction.reply({ 
                content: "⚠️ Une erreur est survenue. Vérifie que mon rôle (le rôle du bot) est placé plus haut que le rôle à modifier dans les paramètres du serveur.", 
                ephemeral: true 
            });
        }
    }
};