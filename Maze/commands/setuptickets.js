const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptickets')
        .setDescription('Envoie le panneau de création de tickets.'),
    
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: "❌ Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        const ticketEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: 'Maze Event | Support', 
                iconURL: interaction.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/AfFp7pu.png' 
            })
            .setTitle('🎫 CENTRE D\'ASSISTANCE & SUPPORT')
            .setDescription(
                "Tu as besoin d'aide, d'un renseignement, ou tu souhaites proposer un projet ? Tu es au bon endroit.\n\n" +
                "Sélectionne la catégorie qui correspond le mieux à ta demande parmi les boutons ci-dessous. Un membre de notre équipe te prendra en charge dans les plus brefs délais.\n\n" +
                "**⚠️ Rappels importants avant d'ouvrir un ticket :**\n" +
                "> 🔹 *Ne mentionne pas le staff inutilement, nous sommes notifiés automatiquement.*\n" +
                "> 🔹 *Sois précis dans ta demande dès l'ouverture pour que nous puissions t'aider plus vite.*\n" +
                "> 🔹 *Tout ticket abusif ou troll sera sanctionné.*"
            )
            .setColor('#2b2d31')
            .addFields(
                { name: '👑 Direction', value: 'Problème grave, signalement important ou contact avec les fondateurs.', inline: true },
                { name: '❓ Questions & Aide', value: 'Besoin d\'un renseignement ou d\'aide sur le fonctionnement du serveur.', inline: true },
                { name: '🎉 Événements', value: 'Proposer une idée de projet ou organiser un événement.', inline: true }
            )
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/AfFp7pu.png')
            .setFooter({ 
                text: 'Maze Event • Support ouvert 24/7', 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_direction')
                    .setLabel('Direction')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👑'),
                new ButtonBuilder()
                    .setCustomId('ticket_questions')
                    .setLabel('Questions')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('❓'),
                new ButtonBuilder()
                    .setCustomId('ticket_events')
                    .setLabel('Événements')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎉')
            );

        await interaction.channel.send({ embeds: [ticketEmbed], components: [row] });
        await interaction.reply({ content: '✅ Panneau de tickets généré avec succès.', ephemeral: true });
    },
};