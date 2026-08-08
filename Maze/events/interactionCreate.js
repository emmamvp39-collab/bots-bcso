const { Events, EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        // ==========================================
        // 1. GESTION DES COMMANDES SLASH
        // ==========================================
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Erreur lors de l\'exécution de cette commande.', ephemeral: true });
            }
        }

        // ==========================================
        // 2. GESTION DES BOUTONS
        // ==========================================
        if (interaction.isButton()) {
            const { customId, user, guild, member, channel } = interaction;

            // --- A. BOUTON DU RÈGLEMENT ---
            if (customId === 'accept_reglement') {
                const roleId = '1495916517546786977';
                const role = guild.roles.cache.get(roleId);

                if (!role) return interaction.reply({ content: "Erreur: Rôle introuvable.", ephemeral: true });
                if (member.roles.cache.has(roleId)) return interaction.reply({ content: "Tu as déjà accès au serveur !", ephemeral: true });

                await member.roles.add(role);
                return interaction.reply({ content: "✅ Règlement accepté, bienvenue !", ephemeral: true });
            }

            // --- B. BOUTONS DE CRÉATION DE TICKET ---
            if (['ticket_direction', 'ticket_questions', 'ticket_events'].includes(customId)) {
                // Définit l'ID de la catégorie selon le bouton cliqué
                let categoryId = '';
                let ticketType = '';

                if (customId === 'ticket_direction') { categoryId = '1535672938584604743'; ticketType = 'Direction'; }
                if (customId === 'ticket_questions') { categoryId = '1535673268407771217'; ticketType = 'Questions'; }
                if (customId === 'ticket_events') { categoryId = '1535673294169317497'; ticketType = 'Événements'; }

                // Création du salon
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: ChannelType.GuildText,
                    parent: categoryId,
                    permissionOverwrites: [
                        {
                            id: guild.id, // @everyone ne voit pas le salon
                            deny: [PermissionsBitField.Flags.ViewChannel],
                        },
                        {
                            id: user.id, // Le créateur voit et écrit
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        }
                        // Ajoute ici l'ID du rôle STAFF si tu veux qu'ils voient le ticket par défaut
                    ]
                });

                await interaction.reply({ content: `✅ Ton ticket a été créé : ${ticketChannel}`, ephemeral: true });

                // Message à l'intérieur du ticket
                const welcomeTicketEmbed = new EmbedBuilder()
                    .setColor('#a6e1ff')
                    .setTitle(`Ticket ${ticketType} - ${user.username}`)
                    .setDescription(`Bienvenue ${user} !\nUn membre du staff va s'occuper de toi sous peu.\nMerci de détailler ta demande en attendant.`);

                const ticketButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('claim_ticket')
                            .setLabel('Prendre en charge')
                            .setStyle(ButtonStyle.Success)
                            .setEmoji('✋'),
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Fermer le ticket')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔒')
                    );

                await ticketChannel.send({ content: `${user}`, embeds: [welcomeTicketEmbed], components: [ticketButtons] });
            }

            // --- C. BOUTON : PRENDRE EN CHARGE[cite: 1] ---
            if (customId === 'claim_ticket') {
                const claimEmbed = new EmbedBuilder()
                    .setColor(0x00FF00) // Vert
                    .setDescription(`✅ **${user.username}** a pris en charge la demande.[cite: 1]`);
                
                await interaction.reply({ embeds: [claimEmbed] });[cite: 1]
                
                // Renomme le salon
                channel.setName(`pris-${channel.name}`).catch(console.error);[cite: 1]

                // Désactiver le bouton "Prendre en charge" plutôt que de le supprimer, c'est plus propre en V14
                const message = interaction.message;[cite: 1]
                const oldRow = message.components[0];[cite: 1]
                
                const newRow = new ActionRowBuilder();
                oldRow.components.forEach(c => {
                    const button = ButtonBuilder.from(c);
                    if (c.customId === 'claim_ticket') button.setDisabled(true); // Grise le bouton
                    newRow.addComponents(button);
                });

                await message.edit({ components: [newRow] });
            }

            // --- D. BOUTON : CLÔTURER LE TICKET[cite: 1] ---
            if (customId === 'close_ticket') {
                const closeEmbed = new EmbedBuilder()
                    .setColor(0xFF0000) // Rouge[cite: 1]
                    .setDescription(`🔒 **${user.username}** a demandé la fermeture du ticket. Le salon sera supprimé dans 5 secondes.[cite: 1]`);[cite: 1]

                await interaction.reply({ embeds: [closeEmbed] });[cite: 1]

                setTimeout(() => {
                    channel.delete().catch(console.error);[cite: 1]
                }, 5000);[cite: 1]
            }
        }
    },
};