/**
 * commands/ticket.js — la commande /ticket et toutes ses sous-commandes
 * /ticket setup    → configurer le système (administrateurs)
 * /ticket panel    → envoyer le panneau "Ouvrir un ticket"
 * /ticket config   → voir la configuration
 * /ticket claim    → prendre en charge un ticket
 * /ticket add      → ajouter un membre au ticket
 * /ticket remove   → retirer un membre du ticket
 * /ticket close    → fermer le ticket
 */
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const store = require('../utils/store');
const handler = require('../handlers/ticketHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Système de tickets du serveur')
    .addSubcommand(sub =>
      sub
        .setName('setup')
        .setDescription('Configurer le système de tickets (administrateurs)')
        .addChannelOption(o =>
          o.setName('categorie').setDescription('Catégorie où créer les salons de tickets').addChannelTypes(ChannelType.GuildCategory)
        )
        .addRoleOption(o => o.setName('role_staff').setDescription('Rôle du staff qui voit les tickets'))
        .addChannelOption(o =>
          o.setName('salon_logs').setDescription('Salon où envoyer les transcriptions').addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('panel')
        .setDescription('Envoyer le panneau "Ouvrir un ticket" (administrateurs)')
        .addChannelOption(o => o.setName('salon').setDescription('Salon où envoyer le panneau').addChannelTypes(ChannelType.GuildText))
        .addStringOption(o => o.setName('titre').setDescription('Titre du panneau'))
        .addStringOption(o => o.setName('description').setDescription('Description du panneau'))
    )
    .addSubcommand(sub => sub.setName('config').setDescription('Voir la configuration actuelle des tickets'))
    .addSubcommand(sub =>
      sub
        .setName('claim')
        .setDescription('Prendre en charge le ticket actuel (staff)')
    )
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Ajouter un membre au ticket actuel')
        .addUserOption(o => o.setName('membre').setDescription('Le membre à ajouter').setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('remove')
        .setDescription('Retirer un membre du ticket actuel')
        .addUserOption(o => o.setName('membre').setDescription('Le membre à retirer').setRequired(true))
    )
    .addSubcommand(sub =>
      sub
        .setName('close')
        .setDescription('Fermer le ticket actuel')
        .addStringOption(o => o.setName('raison').setDescription('La raison de la fermeture'))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const config = store.getGuild(guild.id);
    const estAdmin = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);

    // ═══ /ticket setup ═══
    if (sub === 'setup') {
      if (!estAdmin) {
        return interaction.reply({ content: '❌ Tu dois avoir la permission "Gérer le serveur".', ephemeral: true });
      }
      const categorie = interaction.options.getChannel('categorie');
      const role = interaction.options.getRole('role_staff');
      const logs = interaction.options.getChannel('salon_logs');

      const modifications = {};
      if (categorie) modifications.categoryId = categorie.id;
      if (role) modifications.staffRoleId = role.id;
      if (logs) modifications.logChannelId = logs.id;

      if (Object.keys(modifications).length === 0) {
        return interaction.reply({
          content: '❌ Précise au moins une option : la catégorie, le rôle staff ou le salon de logs.',
          ephemeral: true,
        });
      }

      store.setGuild(guild.id, modifications);
      const apres = store.getGuild(guild.id);

      return interaction.reply({
        content: [
          '✅ Configuration enregistrée :',
          `📁 Catégorie : ${apres.categoryId ? `<#${apres.categoryId}>` : '❌ non définie'}`,
          `👥 Rôle staff : ${apres.staffRoleId ? `<@&${apres.staffRoleId}>` : '❌ non défini'}`,
          `📜 Salon de logs : ${apres.logChannelId ? `<#${apres.logChannelId}>` : '—'}`,
          '',
          'Étape suivante : `/ticket panel` pour envoyer le panneau.',
        ].join('\n'),
        ephemeral: true,
      });
    }

    // ═══ /ticket panel ═══
    if (sub === 'panel') {
      if (!estAdmin) {
        return interaction.reply({ content: '❌ Tu dois avoir la permission "Gérer le serveur".', ephemeral: true });
      }
      const salon = interaction.options.getChannel('salon') || interaction.channel;
      const titre = interaction.options.getString('titre');
      const description = interaction.options.getString('description');

      await salon.send({ embeds: [handler.embedPanel(titre, description)], components: [handler.boutonOuvrir()] });
      return interaction.reply({ content: `✅ Panneau envoyé dans ${salon}.`, ephemeral: true });
    }

    // ═══ /ticket config ═══
    if (sub === 'config') {
      return interaction.reply({
        content: [
          '⚙️ Configuration des tickets :',
          `📁 Catégorie : ${config.categoryId ? `<#${config.categoryId}>` : '❌ non définie'}`,
          `👥 Rôle staff : ${config.staffRoleId ? `<@&${config.staffRoleId}>` : '❌ non défini'}`,
          `📜 Salon de logs : ${config.logChannelId ? `<#${config.logChannelId}>` : '—'}`,
          `🎫 Tickets ouverts : ${Object.keys(config.open).length}`,
          `🔢 Dernier numéro attribué : #${config.counter}`,
        ].join('\n'),
        ephemeral: true,
      });
    }

    // ═══ Commandes suivantes : uniquement dans un ticket ouvert ═══
    const t = store.getTicket(guild.id, interaction.channel.id);

    if (sub === 'claim') {
      if (!t) return interaction.reply({ content: '❌ Cette commande marche uniquement dans un ticket ouvert.', ephemeral: true });
      if (!interaction.member.roles.cache.has(config.staffRoleId)) {
        return interaction.reply({ content: '❌ Seul le staff peut prendre en charge un ticket.', ephemeral: true });
      }
      if (t.claimedBy) {
        return interaction.reply({ content: `Ce ticket est déjà pris en charge par <@${t.claimedBy}>.`, ephemeral: true });
      }
      const maj = store.updateTicket(guild.id, interaction.channel.id, { claimedBy: interaction.user.id });
      await handler.rafraichirMessageTicket(interaction, maj);
      return interaction.reply(`🔔 <@${interaction.user.id}> a pris en charge le ticket #${maj.numero}.`);
    }

    if (sub === 'add') {
      if (!t) return interaction.reply({ content: '❌ Cette commande marche uniquement dans un ticket ouvert.', ephemeral: true });
      const membre = interaction.options.getMember('membre');
      if (!membre) return interaction.reply({ content: '❌ Membre introuvable sur le serveur.', ephemeral: true });
      await interaction.channel.permissionOverwrites.edit(membre.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });
      return interaction.reply(`✅ <@${membre.id}> a été ajouté au ticket.`);
    }

    if (sub === 'remove') {
      if (!t) return interaction.reply({ content: '❌ Cette commande marche uniquement dans un ticket ouvert.', ephemeral: true });
      const membre = interaction.options.getMember('membre');
      if (!membre) return interaction.reply({ content: '❌ Membre introuvable sur le serveur.', ephemeral: true });
      await interaction.channel.permissionOverwrites.delete(membre.id).catch(() => {});
      return interaction.reply(`✅ <@${membre.id}> a été retiré du ticket.`);
    }

    if (sub === 'close') {
      if (!t) return interaction.reply({ content: '❌ Cette commande marche uniquement dans un ticket ouvert.', ephemeral: true });
      const raison = interaction.options.getString('raison');
      await interaction.reply('🔒 Fermeture en cours...');
      return handler.fermerTicket(interaction, t, raison || 'Fermeture via /ticket close');
    }
  },
};
