import fetch from "node-fetch";

const API_URL = "https://www.binance.com/bapi/apex/v1/public/apex/cms/article/list/query?type=1&pageNo=1&pageSize=10&catalogId=161";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) console.error("send message via telegram bot failed, resp:", data);
}

async function fetchDelistingAnnouncements() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`fetch failed, status: ${res.status}`);

  const data = await res.json();

  if (data.success) {
    const catalogs = data.data.catalogs || [];
    let allTitles = "";

    for (const catalog of catalogs) {
      const articles = catalog.articles || [];
      for (const article of articles) {
        const title = article.title;
        const releaseDate = new Date(Number(article.releaseDate) + 8*60*60*1000);
        allTitles += "[" + releaseDate.toISOString().replace("T", " ").split(".")[0] + "] "
            + (title.includes("Delist") || title.includes("下架") ? "⚠️ " : "") 
            + title 
            + "\n";
      }
    }

    if (allTitles) {
      console.log(allTitles);
      await sendTelegramMessage(allTitles);
    } else {
      console.log("not found");
    }
  } else {
    console.error("request succeed but response failure, resp: ", data);
  }
}

async function getUpdates() {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

// // Find chat ID
// getUpdates();

// Test bot
// sendTelegramMessage("test");

fetchDelistingAnnouncements().catch(console.error);
