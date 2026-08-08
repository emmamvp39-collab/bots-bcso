const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Connecté avec succès en tant que ${client.user.tag}`);
        console.log(`🔵 Prêt pour le projet MazeEvent (Interface Bleue chargée) !`);
    },
};