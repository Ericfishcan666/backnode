const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 8060;

// 中間件：解析 JSON 請求主體
app.use(express.json());

// 中間件：解決 CORS 問題
const cors = require("cors");
app.use(cors());

// 爬取 PChome 產品資料
async function fetchProducts(query) {
  const searchUrl = `https://24h.pchome.com.tw/search/?q=${query}`;
  let allProducts = [];

  try {
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
    });
    const html = response.data;

    const $ = cheerio.load(html);

    const titles = $(".c-prodInfoV2__title");
    const prices = $(".c-prodInfoV2__priceValue.c-prodInfoV2__priceValue--m");

    titles.each((index, element) => {
      const title = $(element).text().trim();
      const price = $(prices[index]).text().trim();

      allProducts.push({ title, price });
    });

    return allProducts;
  } catch (error) {
    console.error("抓取產品時出錯:", error);
    return [];
  }
}

// 定義 POST 路由來接收查詢參數
app.post("/", async (req, res) => {
  const { q } = req.body; // 從請求主體解析參數
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (!q) {
    return res.status(400).json({ error: "請提供查詢參數 q" });
  }

  try {
    const products = await fetchProducts(q);
    res.status(200).json(products); // 回傳產品資料
  } catch (error) {
    res.status(500).json({ error: "伺服器發生錯誤，無法處理請求" });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器啟動，請訪問 http://localhost:${PORT}`);
});
