require('dotenv').config();

//const bitcoinMessage = require('dogecore-message')
const bitcoinMessage = require('./message')
const crypto = require('crypto')

let {setCode, getCode, getVerified, setVerified} = require ('./db.js');

const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, Events, ModalBuilder, EmbedBuilder, MessageButton , TextInputBuilder, TextInputStyle  } = require('discord.js');

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;

// Create a new client instance with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.displayName}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  getVerified(message.author.username, async (verified)=>{
    if(!verified)
    {
      const verifyButton = new ButtonBuilder()
      .setCustomId('verify')
      .setLabel('Verify User')
      .setStyle(ButtonStyle.Primary);

      const randomBuffer = crypto.randomBytes(64);
      const randomString = randomBuffer.toString('hex');

      await setCode(message.author.username, randomString, async (id)=>{
        const gotoButton = new ButtonBuilder()
        .setLabel('Sign Data')
        .setStyle(ButtonStyle.Link)
        .setURL("https://thedragontest.com?code=" + randomString);

        const actionRow = new ActionRowBuilder().addComponents(gotoButton, verifyButton);
        
        await message.channel.send({ content: `Welcome ${message.author} to verify on ${message.channel}`, components: [actionRow] });
      });
    }
    else
    {
      await message.channel.send({ content: `Welcome verified user: ${message.author}` });
    }
  });
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if(interaction.customId === "verify")
    {
      const modal = new ModalBuilder()
        .setCustomId('verificationDlg')
        .setTitle('Verification');

      getCode(interaction.user.username, async (code)=>{
        const codeInput = new TextInputBuilder()
          .setCustomId('codeInput')
          .setLabel('Verification code')
          .setValue(code)
          .setStyle(TextInputStyle.Short);

        const addressInput = new TextInputBuilder()
          .setCustomId('addressInput')
          .setLabel('Wallet address')
          .setStyle(TextInputStyle.Short);

        const hashInput = new TextInputBuilder()
          .setCustomId('hashInput')
          .setLabel('Hashcode signed by your wallet')
          .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(codeInput);
        const secondActionRow = new ActionRowBuilder().addComponents(addressInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(hashInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
      });
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'verificationDlg') {
        const hash = interaction.fields.getTextInputValue('hashInput');
        const code = interaction.fields.getTextInputValue('codeInput');
        const address = interaction.fields.getTextInputValue('addressInput');

        const msg = new bitcoinMessage(code);
        const verified = msg.verify(address, hash);
        console.log(verified);
        if(verified)
        {
          await setVerified(interaction.user.username, address, async ()=>{
            await interaction.reply({ content: `Welcome @${interaction.user.username} verified by wallet` });
          });
        }
        else
          await interaction.reply({ content: `Verification is failed for @${interaction.user.username} by wallet` });
    }
  }
});

// Login to Discord with your app's token
client.login(DISCORD_TOKEN);
          