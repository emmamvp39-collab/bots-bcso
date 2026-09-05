const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('migrateforum')
        .setDescription('Copie tous les posts d\'un salon forum vers un autre (Version Anti-Bug).')
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
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch (e) {
            console.error("[MIGRATEFORUM] Erreur deferReply:", e);
            return;
        }

        const sourceForum = interaction.options.getChannel('source');
        const destForum = interaction.options.getChannel('destination');

        if (sourceForum.id === destForum.id) {
            return interaction.editReply({ content: '❌ Le salon source et de destination doivent être différents.' }).catch(() => {});
        }

        try {
            const activeThreads = await sourceForum.threads.fetchActive().catch(() => ({ threads: new Map() }));
            const archivedThreads = await sourceForum.threads.fetchArchived().catch(() => ({ threads: new Map() }));
            
            const allThreadsMap = new Map();
            if (activeThreads.threads) activeThreads.threads.forEach(t => allThreadsMap.set(t.id, t));
            if (archivedThreads.threads) archivedThreads.threads.forEach(t => allThreadsMap.set(t.id, t));
            
            const allThreads = Array.from(allThreadsMap.values());

            if (allThreads.length === 0) {
                return interaction.editReply({ content: '❌ Aucun post trouvé dans le forum source.' }).catch(() => {});
            }

            const total = allThreads.length;
            let successCount = 0;
            let errorCount = 0;

            await interaction.editReply({ 
                content: `🚀 **Démarrage de la migration...**\n📦 **${total}** posts détectés au total.\n⏳ Création en cours (1 post toutes les 5 secondes pour éviter le blocage Discord)...` 
            }).catch(() => {});

            for (let i = 0; i < total; i++) {
                const thread = allThreads[i];

                try {
                    const starterMessage = await thread.fetchStarterMessage().catch(() => null);
                    
                    let messageContent = '*(Contenu introuvable ou supprimé)*';
                    let files = [];

                    if (starterMessage) {
                        messageContent = starterMessage.content || '*(Image ou fichier uniquement)*';
                        files = starterMessage.attachments.map(a => a.url).filter(Boolean);
                    }

                    await destForum.threads.create({
                        name: thread.name.substring(0, 100),
                        message: {
                            content: messageContent.substring(0, 2000),
                            files: files.slice(0, 10)
                        }
                    });

                    successCount++;
                } catch (err) {
                    console.error(`[MIGRATEFORUM] Erreur sur le post "${thread.name}":`, err.message);
                    errorCount++;
                }

                if ((i + 1) % 3 === 0 || (i + 1) === total) {
                    try {
                        await interaction.editReply({ 
                            content: `⏳ **Migration en cours...**\n📊 Progression : **${i + 1} / ${total}** posts traités.\n✅ Succès : ${successCount}\n❌ Erreurs : ${errorCount}\n\n*(Vitesse limitée volontairement pour protéger le bot)*` 
                        });
                    } catch (e) {
                        // On ignore l'erreur si Discord bloque l'actualisation du message après 15 minutes
                    }
                }

                await wait(5000); 
            }

            try {
                await interaction.followUp({ 
                    content: `🎉 **MIGRATION TOTALEMENT TERMINÉE !**\n\n📌 **Bilan final :**\n✅ **${successCount}** posts copiés avec succès.\n❌ **${errorCount}** erreurs rencontrées.`, 
                    flags: MessageFlags.Ephemeral
                });
            } catch (e) {
                console.log("[MIGRATEFORUM] Migration terminée, mais l'interaction originale a expiré.");
            }

        } catch (error) {
            console.error('[MIGRATEFORUM] Erreur globale:', error);
        }
    }
};