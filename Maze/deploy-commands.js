const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
// On récupère TOUT depuis le config.json en une seule fois
const { token, clientId, guildId } = require('./config.json'); 

const commands = [];
// On lit tous les fichiers de commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Début du déploiement de ${commands.length} commandes (Auto-Deploy).`);
        
        // Déploiement sur ton serveur spécifique avec les bonnes variables
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(`Déploiement réussi de ${data.length} commandes !`);
    } catch (error) {
        console.error(error);
    }
})();