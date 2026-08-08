const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setuptickets')
        .setDescription('Envoie le panneau de création de tickets.'),
    
    async execute(interaction) {
        // Optionnel : restreindre cette commande aux admins
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: "Tu n'as pas la permission d'utiliser cette commande.", ephemeral: true });
        }

        const ticketEmbed = new EmbedBuilder()
            .setTitle('🎫 Centre de Support')
            .setDescription('Bienvenue dans l\'assistance !\n\nCliquez sur le bouton correspondant à votre demande ci-dessous pour ouvrir un ticket.\n\n👑 **Direction :** Pour un problème grave ou un contact direct.\n❓ **Questions :** Pour une question sur le serveur.\n🎉 **Événements :** Pour proposer une idée.')
            .setColor('#2b2d31') // Couleur sombre style Discord
            .setFooter({ text: 'Notre équipe vous répondra dans les plus brefs délais.' })
            .setImage('https://i.imgur.com/vHq4wXQ.png'); // Tu peux mettre une bannière sympa ici ou retirer la ligne

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
                    .setLabel('Idée Événements')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎉')
            );

        await interaction.channel.send({ embeds: [ticketEmbed], components: [row] });
        await interaction.reply({ content: 'Panneau de tickets généré avec succès.', ephemeral: true });
    },
};