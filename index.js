const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { SocksProxyAgent } = require('socks-proxy-agent');
const config = require('./config.json');

const agent = new SocksProxyAgent(config.proxy);

const Ryo = new Client({
    intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
});

let Yamada = 0;
let playerHistory = [];
let banWaveHistory = [];

Ryo.on('ready', () => {
    console.log(`✅ Bot sudah online sebagai ${Ryo.user.tag}`);
    Senvas();
});

function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

async function fetchGrowtopiaStatus() {
    try {
        const response = await fetch('https://growtopiagame.com/detail', {
            agent: agent,
            headers: {
                'User-Agent': 'UbiServices_SDK_2022.Release.9_PC64_ansi_static',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        const Senvassss = parseInt(data.online_user);

        console.log(`🌍 Jumlah pemain saat ini: ${Senvassss}`);

        if (!isNaN(Senvassss)) {
            return {
                status: Senvassss > 0 ? '🟢 **Server Aktif**' : '🔴 **Server Mati**',
                playerCount: Senvassss
            };
        }

        console.error('⚠️ Gagal mengambil jumlah pemain dari API');
        return null;
    } catch (error) {
        console.error('❌ Error saat mengambil status Growtopia:', error);
        return null;
    }
}

async function sendMessage(channelId, embed) {
    const channel = Ryo.channels.cache.get(channelId);
    if (channel) {
        channel.send({ embeds: [embed] });
    } else {
        console.error(`⚠️ Tidak dapat menemukan channel dengan ID: ${channelId}`);
    }
}

async function Senvas() {
    const initialData = await fetchGrowtopiaStatus();
    if (initialData) {
        const embed = new EmbedBuilder()
            .setColor('#0000FF')
            .setTitle('🌍 **Growtopia Server Status**')
            .setDescription(`⏰ **Waktu:** ${getCurrentTime()}\n\n📡 **Status:**\n${initialData.status}\n\n👥 **Jumlah Pemain**\n${initialData.playerCount.toLocaleString()}`)
            .setFooter({ text: 'Dexii Store' });

        sendMessage(config.channel_id_1, embed);
        Yamada = initialData.playerCount;
    }

    setInterval(async () => {
        const data = await fetchGrowtopiaStatus();
        if (!data) return;

        const change = Yamada - data.playerCount;
        const percentChange = ((change / Yamada) * 100).toFixed(2);

        playerHistory.push({
            count: data.playerCount,
            time: Date.now()
        });

        playerHistory = playerHistory.filter(p => Date.now() - p.time <= 3600000);
        
        const avgPlayers = playerHistory.length > 0 
            ? Math.round(playerHistory.reduce((acc, curr) => acc + curr.count, 0) / playerHistory.length)
            : data.playerCount;

        const embed = new EmbedBuilder()
            .setColor('#0000FF')
            .setTitle('🌍 **Growtopia Server Status**')
            .setDescription(`⏰ **Waktu:** ${getCurrentTime()}\n\n📡 **Status:**\n${data.status}\n\n👥 **Jumlah Pemain**\n${data.playerCount.toLocaleString()} (${change >= 0 ? '⬆️' : '⬇️'} ${Math.abs(change).toLocaleString()} | ${change >= 0 ? '+' : ''}${percentChange}%)\n\n📊 **Rata-rata 1 Jam**\n${avgPlayers.toLocaleString()} pemain`)
            .setFooter({ text: 'Dexii Store' });

        sendMessage(config.channel_id_1, embed);

        if (Yamada > 0 && change >= 1500) {
            banWaveHistory.push({
                change: change,
                percent: percentChange,
                time: Date.now()
            });
            

            banWaveHistory = banWaveHistory.filter(b => Date.now() - b.time <= 10800000);
            const avgBanWave = banWaveHistory.length > 0
                ? Math.round(banWaveHistory.reduce((acc, curr) => acc + curr.change, 0) / banWaveHistory.length)
                : change;
            const avgBanWavePercent = banWaveHistory.length > 0
                ? (banWaveHistory.reduce((acc, curr) => acc + parseFloat(curr.percent), 0) / banWaveHistory.length).toFixed(2)
                : percentChange;

            const banWaveEmbed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('🚨 **Ban Wave!**')
                .setDescription(`⏰ **Waktu:** ${getCurrentTime()}`)
                .addFields(
                    { name: '📉 Penurunan Pemain', value: `-${change.toLocaleString()} pemain (-${percentChange}%)`, inline: true },
                    { name: '📊 Rata-rata 3 Jam', value: `-${avgBanWave.toLocaleString()} pemain (-${avgBanWavePercent}%)`, inline: true }
                )
                .setFooter({ text: 'Dexii Store' });

            sendMessage(config.channel_id_2, banWaveEmbed);
        }

        Yamada = data.playerCount;
    }, 60000);
}

Ryo.login(config.token);
