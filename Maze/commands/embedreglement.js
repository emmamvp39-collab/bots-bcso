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
            return interaction.reply({ content: "❌ Le salon spécifié est introuvable.", ephemeral: true });
        }

        const reglementEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: 'Maze Event | Administration', 
                iconURL: interaction.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/AfFp7pu.png' 
            })
            .setTitle('📜 RÈGLEMENT OFFICIEL DE MAZE EVENT')
            .setDescription(
                "Bienvenue sur **Maze Event** ! Pour garantir une bonne expérience à tous, merci de lire attentivement et de respecter les règles suivantes :\n\n" +
                "> **1️⃣ Respect & Courtoisie**\n" +
                "> Tout manque de respect, insulte, provocation, discrimination ou harcèlement sera lourdement sanctionné. Soyez bienveillants entre vous.\n>\n" +
                "> **2️⃣ Publicité & Spam**\n" +
                "> La publicité non sollicitée (en public ou en messages privés) est strictement interdite. Le spam et le flood le sont également.\n>\n" +
                "> **3️⃣ Contenu Inapproprié**\n" +
                "> Le contenu NSFW, choquant, illégal ou dégradant n'a pas sa place ici.\n>\n" +
                "> **4️⃣ Directives du Staff**\n" +
                "> Les décisions de l'équipe d'administration sont définitives. En cas de problème, ouvrez un ticket.\n\n" +
                "**💡 Comment accéder au reste du serveur ?**\n" +
                "Clique simplement sur le bouton vert **« Accepter et Rejoindre »** ci-dessous pour valider ta lecture et obtenir tes accès."
            )
            .setColor('#a6e1ff')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }) || 'https://i.imgur.com/AfFp7pu.png')
            .setFooter({ 
                text: 'Maze Event • En validant, tu acceptes de te soumettre à ces règles', 
                iconURL: interaction.client.user.displayAvatarURL() 
            });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_reglement')
                    .setLabel('Accepter et Rejoindre')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✔️')
            );

        await channel.send({ embeds: [reglementEmbed], components: [row] });
        await interaction.reply({ content: `✅ Le règlement a été envoyé avec succès dans le salon <#${channelId}> !`, ephemeral: true });
    },
};