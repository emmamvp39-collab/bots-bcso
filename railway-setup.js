const fs = require('fs');
const path = require('path');

// Récupération des jetons depuis les variables sécurisées de Railway
const botsConfig = {
    "SASP": { token: process.env.TOKEN_SASP },
    "SUPPORT": { token: process.env.TOKEN_SUPPORT },
    "illegal": { token: process.env.TOKEN_ILLEGAL },
    "GOUV": { token: process.env.TOKEN_GOUV },
    "SAMC": { token: process.env.TOKEN_SAMC },
    "IrisFA": { token: process.env.TOKEN_IRISFA },
    "NUXA": { token: process.env.TOKEN_NUXA },
    "ChadoxX_TICKET": { token: process.env.TOKEN_CHADOXX_TICKET },
    "irisstudio_protect": { token: process.env.TOKEN_PROTECT },
    "Irisstudio_ticket": { token: process.env.TOKEN_IRIS_TICKET },
    "BCSO": { token: process.env.TOKEN_BCSO },
    "veyz": { 
        TOKEN: process.env.TOKEN_VEYZ,
        CLIENT_ID: process.env.CLIENT_ID_VEYZ,
        GUILD_ID: process.env.GUILD_ID_VEYZ,
        token: process.env.TOKEN_VEYZ 
    },
    "Maze": { 
        token: process.env.TOKEN_MAZE,
        clientId: process.env.CLIENT_ID_MAZE,
        guildId: process.env.GUILD_ID_MAZE
    }
};

console.log("🛠️ Génération des fichiers config.json pour Railway...");

for (const [folder, data] of Object.entries(botsConfig)) {
    const dirPath = path.join(__dirname, folder);
    
    // Si le dossier du bot existe bien sur le serveur
    if (fs.existsSync(dirPath)) {
        // On crée le fichier config.json à la volée avec les données
        fs.writeFileSync(path.join(dirPath, 'config.json'), JSON.stringify(data, null, 2));
        console.log(`✅ config.json généré pour : ${folder}`);
    }
}