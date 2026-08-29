const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creersalon')
        .setDescription('Créé un nouveau salon (Texte ou Vocal).')
        .addStringOption(option => 
            option.setName('nom')
                .setDescription('Le nom du salon à créer')
                .setRequired(true)
        )
        .addChannelOption(option => 
            option.setName('categorie')
                .setDescription('La catégorie où placer le salon')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Le type de salon')
                .setRequired(false)
                .addChoices(
                    { name: 'Textuel', value: 'text' },
                    { name: 'Vocal', value: 'voice' }
                )
        ),
        
    async execute(interaction, client) {
        // 1. Sécurité : Restriction par ID Discord
        if (interaction.user.id !== '1247264549489610897') {
            return interaction.reply({ 
                content: "❌ Tu n'as pas l'autorisation d'utiliser cette commande.", 
                ephemeral: true 
            });
        }

        // 2. Récupération des options
        const nom = interaction.options.getString('nom');
        const categorie = interaction.options.getChannel('categorie');
        const typeSalon = interaction.options.getString('type') || 'text'; 

        const channelType = typeSalon === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;

        try {
            // 3. Création du salon
            const nouveauSalon = await interaction.guild.channels.create({
                name: nom,
                type: channelType,
                parent: categorie ? categorie.id : null,
            });

            // 4. Message de confirmation
            await interaction.reply({ 
                content: `✅ Le salon ${nouveauSalon} a été créé avec succès.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error("❌ Erreur lors de la création du salon :", error);
            await interaction.reply({ 
                content: "⚠️ Une erreeeur est survenue. Vérifiez que j'ai bien les permissions d'administrateur.", 
                ephemeral: true 
            });
        }
    }
};