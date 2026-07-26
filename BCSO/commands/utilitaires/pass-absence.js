const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Création dynamique d'un dossier "data" à la racine si besoin
const dataDir = path.join(__dirname, '../../data');
const passesFile = path.join(dataDir, 'passes.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(passesFile)) fs.writeFileSync(passesFile, JSON.stringify([]));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pass-absence')
        .setDescription('Gère les pass d\'immunité pour les absences Rollcall.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild) // Réservé aux admins
        .addUserOption(option => 
            option.setName('agent')
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

    async execute(interaction) {
        const user = interaction.options.getUser('agent');
        const action = interaction.options.getString('action');
        
        let passes = JSON.parse(fs.readFileSync(passesFile, 'utf8'));

        if (action === 'add') {
            if (!passes.includes(user.id)) {
                passes.push(user.id);
                fs.writeFileSync(passesFile, JSON.stringify(passes, null, 2));
                return interaction.reply({ content: `✅ Le pass d'immunité a été **ajouté** pour <@${user.id}>. Les alertes seront ignorées.`, ephemeral: true });
            } else {
                return interaction.reply({ content: `⚠️ <@${user.id}> possède **déjà** un pass d'immunité.`, ephemeral: true });
            }
        } else {
            if (passes.includes(user.id)) {
                passes = passes.filter(id => id !== user.id);
                fs.writeFileSync(passesFile, JSON.stringify(passes, null, 2));
                return interaction.reply({ content: `❌ Le pass d'immunité a été **retiré** pour <@${user.id}>.`, ephemeral: true });
            } else {
                return interaction.reply({ content: `⚠️ <@${user.id}> n'avait **pas** de pass d'immunité actif.`, ephemeral: true });
            }
        }
    }
};