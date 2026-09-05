const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clonepost')
        .setDescription('Copie un post spécifique vers un autre forum (1 par 1).')
        .addChannelOption(option =>
            option.setName('post')
                .setDescription('Le post exact que tu veux copier (tape son nom)')
                // Les posts de forum sont considérés comme des PublicThreads par Discord
                .addChannelTypes(ChannelType.PublicThread) 
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('Le salon forum de destination')
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const sourceThread = interaction.options.getChannel('post');
        const destForum = interaction.options.getChannel('destination');

        try {
            // Récupérer le premier message du post
            const starterMessage = await sourceThread.fetchStarterMessage().catch(() => null);
            
            let messageContent = '*(Contenu introuvable ou supprimé)*';
            let files = [];

            if (starterMessage) {
                messageContent = starterMessage.content || '*(Image ou fichier uniquement)*';
                // Récupération des images/fichiers
                files = starterMessage.attachments.map(a => a.url).filter(Boolean);
            }

            // Création du post dans le nouveau forum
            const newThread = await destForum.threads.create({
                name: sourceThread.name,
                message: {
                    content: messageContent,
                    files: files
                }
            });

            await interaction.editReply({ 
                content: `✅ Le post **${sourceThread.name}** a été copié avec succès dans <#${destForum.id}> !\n*(Nouveau post : <#${newThread.id}>)*` 
            });

        } catch (error) {
            console.error(`[CLONEPOST] Erreur:`, error);
            await interaction.editReply({ 
                content: '❌ Une erreur est survenue lors de la copie. Vérifie que le bot a bien les permissions.' 
            });
        }
    },
};