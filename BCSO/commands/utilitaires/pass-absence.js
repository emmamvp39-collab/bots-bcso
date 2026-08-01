const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.js'); // 🚀 Importation de la config

const dataDir = path.join(__dirname, '../../data');
const passesFile = path.join(dataDir, 'passes.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(passesFile)) fs.writeFileSync(passesFile, JSON.stringify([]));

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
        // 🔒 Sécurité : Vérification dynamique via config.js
        if (interaction.user.id !== config.ownerId) {
            return interaction.reply({ content: "❌ Cette commande est réservée au créateur du bot.", ephemeral: true });
        }

        const cible = interaction.options.getUser('cible');
        const action = interaction.options.getString('action');
        
        let passes = JSON.parse(fs.readFileSync(passesFile, 'utf8'));

        try {
            if (action === 'add') {
                if (!passes.includes(cible.id)) {
                    passes.push(cible.id);
                    fs.writeFileSync(passesFile, JSON.stringify(passes, null, 2));
                    await interaction.reply({ content: `✅ Accès accordé : Le pass d'immunité a été ajouté pour ${cible}.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `⚠️ ${cible} possède déjà un pass d'immunité.`, ephemeral: true });
                }
            } else {
                if (passes.includes(cible.id)) {
                    passes = passes.filter(id => id !== cible.id);
                    fs.writeFileSync(passesFile, JSON.stringify(passes, null, 2));
                    await interaction.reply({ content: `❌ Le pass d'immunité a été retiré pour ${cible}.`, ephemeral: true });
                } else {
                    await interaction.reply({ content: `⚠️ ${cible} n'avait pas de pass d'immunité actif.`, ephemeral: true });
                }
            }
        } catch (error) {
            console.error("❌ Erreur lors de la gestion du pass :", error);
            await interaction.reply({ content: "⚠️ Une erreur est survenue lors de la modification du pass.", ephemeral: true });
        }
    }
};