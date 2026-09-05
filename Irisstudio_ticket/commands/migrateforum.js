const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('migrateforum')
        .setDescription('Copie tous les posts d\'un salon forum vers un autre avec suivi en temps réel.')
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
        await interaction.deferReply({ ephemeral: true });

        const sourceForum = interaction.options.getChannel('source');
        const destForum = interaction.options.getChannel('destination');

        if (sourceForum.id === destForum.id) {
            return interaction.editReply({ content: '❌ Le salon source et de destination doivent être différents.' });
        }

        try {
            // Récupération des posts actifs et archivés[cite: 1]
            const activeThreads = await sourceForum.threads.fetchActive();
            const archivedThreads = await sourceForum.threads.fetchArchived();
            
            const allThreads = [...activeThreads.threads.values(), ...archivedThreads.threads.values()];

            if (allThreads.length === 0) {
                return interaction.editReply({ content: '❌ Aucun post trouvé dans le forum source.' });
            }

            const total = allThreads.length;
            let successCount = 0;
            let errorCount = 0;

            await interaction.editReply({ 
                content: `🚀 **Démarrage de la migration...**\n📦 **${total}** posts détectés au total.\n⏳ Préparation du premier post...` 
            });

            for (let i = 0; i < total; i++) {
                const thread = allThreads[i];

                try {
                    // Récupération sécurisée du premier message[cite: 1]
                    const starterMessage = await thread.fetchStarterMessage().catch(() => null);
                    
                    let messageContent = '*(Contenu introuvable ou supprimé)*';
                    let files = [];

                    if (starterMessage) {
                        messageContent = starterMessage.content || '*(Image ou fichier uniquement)*';
                        files = starterMessage.attachments.map(a => a.url);
                    }

                    // Création dans le nouveau forum[cite: 1]
                    await destForum.threads.create({
                        name: thread.name,
                        message: {
                            content: messageContent,
                            files: files
                        }
                    });

                    successCount++;
                } catch (err) {
                    console.error(`[MIGRATEFORUM] Erreur sur le post "${thread.name}":`, err);
                    errorCount++;
                }

                // Mise à jour du message Discord en temps réel
                // On met à jour l'affichage à chaque post pour que tu saches exactement où ça en est
                await interaction.editReply({ 
                    content: `⏳ **Migration en cours...**\n📊 Progression : **${i + 1} / ${total}** posts traités.\n✅ Succès : ${successCount}\n❌ Erreurs : ${errorCount}\n\n*(Post actuel : ${thread.name})*` 
                });

                // Délai augmenté à 4 secondes pour contrer les limitations strictes de Discord sur les forums[cite: 1]
                await wait(4000); 
            }

            // Alerte finale une fois la boucle terminée[cite: 1]
            await interaction.followUp({ 
                content: `🎉 **MIGRATION TOTALEMENT TERMINÉE !**\n\n📌 **Bilan final :**\n✅ **${successCount}** posts copiés avec succès.\n❌ **${errorCount}** erreurs rencontrées.\n\n*Tu peux maintenant supprimer l'ancien forum si tout est bon.*`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('[MIGRATEFORUM] Erreur globale:', error);
            await interaction.editReply({ content: '❌ Une erreur critique est survenue lors de l\'analyse du forum.' });
        }
    },
};