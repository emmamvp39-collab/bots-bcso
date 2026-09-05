const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('migrateforum')
        .setDescription('Copie tous les posts d\'un salon forum vers un autre.')
        .addChannelOption(option =>
            option.setName('source')
                .setDescription('Le salon forum d\'origine contenant les posts à copier')
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('Le salon forum de destination')
                .addChannelTypes(ChannelType.GuildForum)
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Déférer la réponse car l'opération va prendre du temps
        await interaction.deferReply({ ephemeral: true });

        const sourceForum = interaction.options.getChannel('source');
        const destForum = interaction.options.getChannel('destination');

        if (sourceForum.id === destForum.id) {
            return interaction.editReply({ content: 'Le salon source et le salon de destination doivent être différents.' });
        }

        try {
            // Récupérer les posts actifs et archivés du forum source
            const activeThreads = await sourceForum.threads.fetchActive();
            const archivedThreads = await sourceForum.threads.fetchArchived();
            
            // Fusionner tous les threads (posts) dans un seul tableau
            const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

            if (allThreads.length === 0) {
                return interaction.editReply({ content: 'Aucun post trouvé dans le forum source.' });
            }

            await interaction.editReply({ content: `Début de la migration de **${allThreads.length}** posts. Cela peut prendre un certain temps pour éviter les limites de l'API Discord...` });

            let successCount = 0;
            let errorCount = 0;

            for (const thread of allThreads) {
                try {
                    // Récupérer le premier message du post (le contenu)
                    const starterMessage = await thread.fetchStarterMessage();
                    
                    if (!starterMessage) {
                        errorCount++;
                        continue;
                    }

                    // Préparer les pièces jointes s'il y en a
                    const attachments = starterMessage.attachments.map(a => a.url);

                    // Créer le nouveau post dans le forum de destination
                    await destForum.threads.create({
                        name: thread.name,
                        message: {
                            content: starterMessage.content || '*(Contenu vide ou image uniquement)*',
                            files: attachments
                        }
                    });

                    successCount++;
                    
                    // Pause de 3 secondes entre chaque création pour éviter le Rate Limit de Discord (Bannissement API)
                    await wait(3000); 

                } catch (err) {
                    console.error(`Erreur lors de la copie du post ${thread.name}:`, err);
                    errorCount++;
                }
            }

            await interaction.followUp({ 
                content: `✅ Migration terminée ! \n- **${successCount}** posts copiés avec succès.\n- **${errorCount}** erreurs rencontrées.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Une erreur critique est survenue lors de la récupération des posts.' });
        }
    },
};