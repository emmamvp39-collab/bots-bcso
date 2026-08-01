const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embedvip')
        .setDescription('Envoie l\'embed d\'accès Premium dans le salon dédié.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Réservé à la direction/staff
        
    async execute(interaction) {
        // Le salon cible où envoyer l'embed VIP
        const targetChannelId = '1516530639460110336';
        const targetChannel = interaction.client.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ content: "❌ Le salon cible est introuvable. Vérifie l'ID.", ephemeral: true });
        }

        // --- DESIGN PREMIUM VIP ---
        const goldColor = '#d4af37'; // Couleur or assortie au thème Iris'Studio
        
        const vipEmbed = new EmbedBuilder()
            .setColor(goldColor)
            .setAuthor({ name: "Iris'Studio | Accès Exclusif", iconURL: interaction.guild.iconURL() })
            .setTitle('💎 ACCÈS PREMIUM Iris\'Studio')
            .setDescription("Débloque l'accès Premium d'Iris'Studio et profite d'un catalogue exclusif de contenus régulièrement mis à jour.\n\n**Ce que comprend l'accès Premium :**\n> ✨ Bases exclusives et de qualité\n> ✨ Scripts optimisés et contenus inédits\n> ✨ Mappings sélectionnés\n> ✨ Packs graphiques performants\n> ✨ Packs de tenues et véhicules rares\n> ✨ Accès en avant-première aux prochaines nouveautés")
            .addFields(
                { 
                    name: '👀 Découvrir le contenu', 
                    value: "Rends-toi dans le salon <#1516530613333524731> pour consulter un aperçu du contenu disponible avant de rejoindre le Premium." 
                },
                { 
                    name: '💳 Tarif', 
                    value: "**6,5 €** pour obtenir ton accès Premium.\n\n*Moyens de paiement acceptés :*\n> • PayPal" 
                },
                { 
                    name: '📩 Comment obtenir ton accès ?', 
                    value: "Ouvre simplement un ticket dans <#1516531376436940910> et un membre de l'équipe s'occupera de ta demande dans les meilleurs délais." 
                }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: "Iris'Studio Premium", iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        try {
            await targetChannel.send({ embeds: [vipEmbed] });
            
            // Message de confirmation caché pour celui qui tape la commande
            await interaction.reply({ content: `✅ L'embed VIP a été publié avec succès dans <#${targetChannelId}> !`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "❌ Une erreur s'est produite lors de l'envoi de l'embed.", ephemeral: true });
        }
    }
};