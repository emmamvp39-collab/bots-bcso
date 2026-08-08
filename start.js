const { spawn } = require('child_process');
const path = require('path');

// 🔗 CONFIGURATION CENTRALISÉE
const WEBHOOK_URL = "https://canary.discord.com/api/webhooks/1491956067536736358/IP3xrUpadtoGnvHgifUPpnoJyc0177wabRrqZPh55rBXp6mVD0eBGbVE7Qk5XbHZCMWV";

// 📦 Liste des bots (Mis à jour avec tes deux nouveaux bots IrisStudio)
const bots = [
    { name: "SASP", dir: "SASP", file: "index.js" },
    { name: "SUPPORT", dir: "SUPPORT", file: "index.js" },
    { name: "IrisFA ILLEGAL", dir: "illegal", file: "index.js" },
    { name: "IrisFA LLEGAL", dir: "légal", file: "index.js" },
    { name: "GOUV", dir: "GOUV", file: "index.js" },
    { name: "SAMC", dir: "SAMC", file: "index.js" },
    { name: "IrisFA", dir: "IrisFA", file: "index.js" },
    { name: "NUXA", dir: "NUXA", file: "index.js" },
    { name: "ChadoxX TICKET", dir: "chadoxxticket", file: "index.js" },
    { name: "IrisStudio PROTECT", dir: "irisstudio_protect", file: "index.js" },
    { name: "IrisStudio TICKET", dir: "Irisstudio_ticket", file: "index.js" }, 
    { name: "veyz", dir: "veyz", file: "index.js" },
    { name: "BCSO", dir: "BCSO", file: "index.js" },
    { name: "MazeEvent", dir: "Maze", file: "index.js" }
];

// 📨 Envoi webhook
async function sendWebhook(payload) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Erreur Webhook :", err.message);
    }
}

// 🚀 Lancement d’un bot
const startBot = (bot) => {
    console.log(`🚀 Lancement de ${bot.name}...`);

    // CORRECTION : Ajout de l'env pour transmettre les tokens de Railway aux bots
    const child = spawn(process.execPath, [bot.file], {
        cwd: path.join(__dirname, bot.dir),
        stdio: ['inherit', 'inherit', 'pipe'],
        env: { ...process.env } 
    });

    let errorBuffer = "";

    // 📛 Capture erreurs
    child.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        errorBuffer += errorMessage;
        console.error(`❌ [${bot.name}] ${errorMessage}`);
    });

    // 💥 Si crash
    child.on('close', async (code) => {
        if (code !== 0 && code !== null) {
            console.log(`⚠️ ${bot.name} crash (Code: ${code})`);

            const payload = {
                username: "IrisFA Monitor",
                embeds: [
                    {
                        title: `🚨 CRASH : ${bot.name}`,
                        color: 0xff0000,
                        description: `Le bot **${bot.name}** vient de crash.`,
                        fields: [
                            { name: "📂 Dossier", value: `\`${bot.dir}\``, inline: true },
                            { name: "🔢 Code", value: `\`${code}\``, inline: true },
                            { name: "💬 Erreur", value: `\`\`\`js\n${errorBuffer.slice(-1000) || "Aucune erreur"}\n\`\`\`` }
                        ],
                        timestamp: new Date()
                    }
                ]
            };

            await sendWebhook(payload);

            // 🔄 Restart auto
            setTimeout(() => {
                startBot(bot);
            }, 5000);
        } else {
            console.log(`✅ ${bot.name} arrêté proprement.`);
        }
    });

    // ❌ Erreur spawn
    child.on('error', async (err) => {
        console.error(`❌ Impossible de lancer ${bot.name} :`, err.message);
        await sendWebhook({
            username: "IrisFA Monitor",
            embeds: [
                {
                    title: `🚨 ERREUR LANCEMENT : ${bot.name}`,
                    color: 0xff0000,
                    description: `Impossible de lancer le bot.`,
                    fields: [
                        { name: "💬 Erreur", value: `\`\`\`${err.message}\`\`\`` }
                    ],
                    timestamp: new Date()
                }
            ]
        });
    });
};

// 🚀 Démarrage global
console.log("🚀 Démarrage du gestionnaire IrisFA...");
bots.forEach(bot => {
    startBot(bot);
});

// 🟢 Notification démarrage
sendWebhook({
    content: "🟩 **Le gestionnaire de bots IrisFA vient de démarrer.**"
});