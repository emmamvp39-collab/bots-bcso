const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clonepost')
        .setDescription('Copie un post spécifique vers un autre forum (1 par 1).')
        .addChannelOption(option =>
            option.setName('post')
                .setDescription('Le post exact que tu veux copier (tape son nom)')
                .addChannelTypes(ChannelType.PublicThread) 
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('Le salon forum de destination')
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const sourceThread = interaction.options.getChannel('post');
            const destForum = interaction.options.getChannel('destination');

            if (!sourceThread || !destForum) {
                return interaction.editReply({ content: '❌ Erreur : Salon introuvable.' }).catch(() => {});
            }

            const starterMessage = await sourceThread.fetchStarterMessage().catch(() => null);
            
            let messageContent = '*(Contenu introuvable ou supprimé)*';
            let files = [];

            if (starterMessage) {
                messageContent = starterMessage.content || '*(Image ou fichier uniquement)*';
                files = starterMessage.attachments.map(a => a.url).filter(Boolean);
            }

            const newThread = await destForum.threads.create({
                name: sourceThread.name.substring(0, 100), 
                message: {
                    content: messageContent.substring(0, 2000), 
                    files: files.slice(0, 10) 
                }
            });

            await interaction.editReply({ 
                content: `✅ Le post **${sourceThread.name}** a été copié avec succès dans <#${destForum.id}> !\n*(Nouveau post : <#${newThread.id}>)*` 
            }).catch(() => {});

        } catch (error) {
            console.error(`[CLONEPOST] Erreur attrapée (le bot ne plantera pas) :`, error);
            try {
                await interaction.editReply({ 
                    content: `❌ Une erreur est survenue lors de la copie : \`${error.message}\`.` 
                });
            } catch (e) {
                // Ignore si l'interaction a expiré
            }
        }
    },
};