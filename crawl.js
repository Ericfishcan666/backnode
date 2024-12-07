
const http = require("http");
const axios = require("axios");
const cheerio = require("cheerio");
const url = "https://24h.pchome.com.tw/search/?q=鉛筆";///要手動修改網址後面的文字 才能顯示特定商品

async function fetchProducts() {
  let allProducts = []; 

  try {
    
    const response = await axios.get(url, {
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

    return allProducts; // 返回所有產品資料
  } catch (error) {
    console.error("抓取產品時出錯:", error);
    return [];
  }
}

// 建立 HTTP 伺服器
http.createServer(async function (req, res) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      const allNews = await fetchProducts();
      res.end(JSON.stringify(allNews, null, 2));
  })
  .listen(8060);
