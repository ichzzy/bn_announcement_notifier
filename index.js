import fetch from "node-fetch";

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;
const BN_LIST_ANNO_API = "https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=1&pageSize=10";

async function main() {
  const res = await fetch(BN_LIST_ANNO_API);
  if (!res.ok) throw new Error(`fetch failed, status: ${res.status}`);

  const data = await res.json();

  if (data.success) {
    const catalogs = data.data.catalogs || [];
    let allTitles = "";

    const now = Date.now();
    const checkInterval = 60 * 60 * 1000; // due to the delay of the github workflow, set to 1 hour

    for (let catalog of catalogs) {
      let articles = catalog.articles || [];
      for (let article of articles) {
        let releaseDate = Number(article.releaseDate); // Millis

        if (now - releaseDate <= checkInterval) {
          const releaseDateStr = new Date(releaseDate).toLocaleString("zh-TW", {
            timeZone: "Asia/Taipei",
            hour12: false,
          });

          let isTarget = false;
          let tag = "";
          
          if (catalog.catalogId === 161 || article.title.includes("Delist") || article.title.includes("delist")) {
            tag = "⚠️ ";
            isTarget = true;
          } else if (article.title.includes("Monitoring Tag") || article.title.includes("monitoring tag")) {
            tag = "🔍 ";
            isTarget = true;
          }

          if (isTarget) {
            const url = `https://www.binance.com/en/support/announcement/${article.code}`;
            allTitles += `[${releaseDateStr}] ${tag}<a href="${url}">${article.title}</a>\n`;
          }
        }
      }
    }

    if (allTitles) {
      console.log(allTitles);
      await sendTelegramMessage(allTitles);
    } else {
      console.log("no news");
    }
  } else {
    console.error("request succeed but response failed, resp: ", data);
  }
}

async function sendTelegramMessage(text) {
  const payload = {
    chat_id: TG_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };

  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) console.error("send message via telegram bot failed, resp:", data);
}

async function getUpdates() {
  const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getUpdates`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

// To find chat ID
// getUpdates();

// Test bot
// sendTelegramMessage("test");

main().catch(console.error);
