const http = require("http");
const axios = require("axios");
const cheerio = require("cheerio");
const querystring = require("querystring");

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

    // 遍歷產品標題和價格
    titles.each((index, element) => {
      const title = $(element).text().trim();
      const price = $(prices[index]).text().trim();

      // 將產品資訊存入物件
      const product = {
        title: title,
        price: price,
      };

      allProducts.push(product);
    });

    return allProducts;
  } catch (error) {
    console.error("抓取產品時出錯:", error);
    return [];
  }
}

// 建立 HTTP 伺服器
http
  .createServer(async function (req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    
    const queryParams = querystring.parse(req.url.split("?")[1]);
    const query = queryParams.q;

    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "請提供查詢參數 q" }));
      return;
    }

    const allProducts = await fetchProducts(query);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(allProducts, null, 2));
  })
  .listen(8060, () => {
    console.log("伺服器啟動，請訪問 http://localhost:8060?q=商品名稱");
  });
