const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pass-absence')
        .setDescription('Ajoute ou retire une immunité Rollcall pour un agent (Owner uniquement).')
        .addUserOption(option => 
            option.setName('cible')
                .setDescription('L\'agent concerné')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Ajouter ou retirer le pass')
                .setRequired(true)
                .addChoices(
                    { name: 'Ajouter', value: 'add' },
                    { name: 'Retirer', value: 'remove' }
                )
        ),

    async execute(interaction, client) {
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "❌ Cette commande est réservée au créateur du bot.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const cible = interaction.options.getUser('cible');
        const action = interaction.options.getString('action');
        
        // ⚠️ Vérifie que l'URL correspond bien à ton nom de domaine Railway actuel
        const API_URL = 'https://bcso-noface.up.railway.app/api/rollcall/pass'; 

        try {
            // Le bot envoie l'ordre au site web
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: cible.id, action: action })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return interaction.editReply(`⚠️ Impossible de modifier le pass. Le site a répondu : ${errorData.error || 'Erreur inconnue (Vérifie que l\'ID Discord est bien lié à un Agent sur le site)'}`);
            }

            if (action === 'add') {
                await interaction.editReply(`✅ Accès accordé : Le pass d'immunité a été enregistré de façon permanente dans la BDD pour ${cible}.`);
            } else {
                await interaction.editReply(`❌ Le pass d'immunité a été retiré de la BDD pour ${cible}.`);
            }
        } catch (error) {
            console.error("❌ Erreur lors de la gestion du pass :", error);
            await interaction.editReply("⚠️ Une erreur est survenue lors de la communication avec le site web.");
        }
    }
};