# GT-StatusBot 
Bot Discord untuk memantau status server Growtopia secara real-time.  

##  Fitur  
- Mengecek jumlah pemain online setiap menit  
- Mengirim pembaruan status server ke channel Discord  
- Mendeteksi **ban wave** secara otomatis  
- Mendukung **SOCKS5 proxy**

## ⚙️ Instalasi  

1. **Clone repository:**  
2. Install dependencies:
```
npm install```


4. Konfigurasi di config.json:
```
{
  "token": "DISCORD_BOT_TOKEN",
  "proxy": "socks5://user:pass@host:port",
  "channel_id1": "CHANNEL_ID_STATUS",
  "channel_id2": "CHANNEL_ID_BANWAVE"
}```


4. Jalankan bot:
```
node index.js
```
