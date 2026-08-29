// BCSO/events/deployCommands.js
const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

module.exports = (client) => {
    client.commands = new Collection();

    client.once('ready', async () => {
        const commandsArray = [];
        const loadedNames = new Set(); // Traqueur de doublons
        const commandsPath = path.join(__dirname, '../commands');
        
        if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });

        const commandFolders = fs.readdirSync(commandsPath);
        
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (!fs.statSync(folderPath).isDirectory()) continue;

            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`${folderPath}/${file}`);
                if ('data' in command && 'execute' in command) {
                    
                    // VÉRIFICATION ANTI-DOUBLON
                    if (loadedNames.has(command.data.name)) {
                        console.log(`🚨 DOUBLON DÉTECTÉ ! La commande "${command.data.name}" est déjà utilisée. Fichier coupable : ${file}`);
                    } else {
                        loadedNames.add(command.data.name);
                        client.commands.set(command.data.name, command);
                        commandsArray.push(command.data.toJSON());
                        console.log(`➡️ Chargée : ${command.data.name} (depuis ${file})`);
                    }
                }
            }
        }

        if (commandsArray.length > 0) {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BCSO);
            try {
                // 1. PURGE DES COMMANDES GLOBALES
                await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
                
                // 2. DÉPLOIEMENT SUR LA GUILDE
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, config.guildId),
                    { body: commandsArray }
                );
                console.log(`✅ [Commandes BCSO] Synchronisation terminée : ${commandsArray.length} commande(s) active(s).`);
            } catch (error) {
                console.error("❌ [Commandes BCSO] Erreur lors du déploiement :", error);
            }
        }
    });
};