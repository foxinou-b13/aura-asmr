/**
 * deploy-commands.js
 * ──────────────────────────────────────────────
 * Ce script enregistre les commandes slash auprès de Discord.
 * À relancer à chaque fois que tu ajoutes ou modifies une commande.
 *
 * Les commandes sont enregistrées GLOBALEMENT : elles fonctionnent sur
 * TOUS les serveurs où le bot est présent. Attention : Discord peut prendre
 * jusqu'à 1 heure pour les afficher partout (c'est normal).
 */

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const token = (process.env.DISCORD_TOKEN || '').trim();
const clientId = (process.env.CLIENT_ID || '').trim();

if (!token || token.startsWith('colle_')) {
  console.error('❌ Le token du bot n\'est pas configuré dans le fichier .env');
  process.exit(1);
}
if (!clientId || clientId.startsWith('colle_')) {
  console.error('❌ Le CLIENT_ID n\'est pas configuré dans le fichier .env');
  process.exit(1);
}

// On récupère toutes les commandes du dossier "commands/"
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

// On envoie la liste des commandes à Discord (enregistrement global)
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log(`⏳ Enregistrement de ${commands.length} commandes slash globales...`);
    const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`✅ ${data.length} commandes enregistrées avec succès !`);
    console.log('ℹ️  Elles peuvent mettre jusqu\'à 1 heure à apparaître sur tous les serveurs.');
  } catch (error) {
    console.error('❌ Erreur pendant l\'enregistrement des commandes :');
    console.error(error);
    process.exit(1);
  }
})();
