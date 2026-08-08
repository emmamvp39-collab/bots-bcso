const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedreglement')
        .setDescription('Envoie l\'embed du règlement dans le salon spécifique.'),
    
    async execute(interaction) {
        // ID du salon où envoyer le règlement
        const channelId = '1495916641568166031';
        const channel = interaction.client.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply({ content: "Le salon spécifié est introuvable.", ephemeral: true });
        }

        // Création du bel embed
        const reglementEmbed = new EmbedBuilder()
            .setTitle('📜 Règlement du Serveur')
            .setDescription('Bienvenue sur le serveur !\n\nPour accéder à l\'intégralité des salons, veuillez lire nos règles et cliquer sur le bouton ci-dessous pour les accepter.\n\n**1.** Soyez respectueux envers les autres membres.\n**2.** Pas de spam ni de publicités.\n**3.** Écoutez le staff.')
            .setColor('#a6e1ff') // La couleur que tu as demandée
            .setFooter({ text: 'Merci de valider pour continuer.' });

        // Création du bouton
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_reglement') // C'est cet ID qu'on va écouter
                    .setLabel('Accepter le règlement')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

        // Envoi du message dans le salon spécifique
        await channel.send({ embeds: [reglementEmbed], components: [row] });

        // Réponse pour confirmer à celui qui a tapé la commande (visible juste pour lui)
        await interaction.reply({ content: `Le règlement a été envoyé avec succès dans le salon <#${channelId}> !`, ephemeral: true });
    },
};