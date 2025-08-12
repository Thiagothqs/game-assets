// scraper.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors()); // permite acesso do Angular

app.get('/api/wallpapersXbox', async (req, res) => {
  const url = req.query.url;
  const urlSplit = url.split("/");
  const id = urlSplit[urlSplit.length - 1].toUpperCase();

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // você pode ajustar esse seletor com base na estrutura da página
    const scripts = $("script")[2];
    // console.log(scripts.children[0].data);
    const content = scripts.children[0].data;
    if (content && content.includes('window.__PRELOADED_STATE__')) {
      const match = content.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});/s);
      if (match && match[1]) {
        preloadedStateRaw = match[1];
      }
    }

    const json = JSON.parse(preloadedStateRaw);
    const imagesJson = json.core2.products.productSummaries[id].images;
    // console.log(imagesJson);

    res.json(imagesJson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

app.get('/api/wallpapersPlaystation', async (req, res) => {
  const url = `https://store.playstation.com/pt-br/search/${req.query.gameName}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const scripts = $("#__NEXT_DATA__");
    const content = JSON.parse(scripts.text());
    const imagesJson = Object.keys(content.props.apolloState)
      .filter(f => f.startsWith("Product:"))
      .map(m => content.props.apolloState[m]);
    // console.log(imagesJson);

    res.json(imagesJson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

app.get('/api/wallpapersPlaystationPage', async (req, res) => {
  const url = `https://web.np.playstation.com/api/graphql/v1/op?operationName=productRetrieveForUpsellWithCtas&variables=%7B%22productId%22%3A%22${req.query.productId}%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%22fb0bfa0af4d8dc42b28fa5c077ed715543e7fb8a3deff8117a50b99864d246f1%22%7D%7D`;

  try {
    const headers = {
      headers: {
          "accept": "application/json",
          "accept-language": "pt-BR",
          "apollographql-client-name": "@sie-private/web-commerce-anywhere",
          "apollographql-client-version": "3.23.0",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "disable_query_whitelist": "false",
          "origin": "https://store.playstation.com",
          "pragma": "no-cache",
          "priority": "u=1, i",
          "referer": "https://store.playstation.com/",
          "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
          "x-psn-app-ver": "@sie-private/web-commerce-anywhere/3.23.0-d3947b39a30477ef83ad9e5fc7f3f6a72e17bb6b",
          "x-psn-store-locale-override": "pt-BR",
          "Cookie": "bm_ss=ab8e18ef4e; bm_so=02640FD5599A4E70B60D0F5C15AF6BABBB4FE9DE880CF0454D5675871F4E4B21~YAAQZMQQAvY0gXmYAQAA4bNpfwSZWliMXmUFaoBQ1qJ0ovFSV0PXeceXV27fgre1SEgImUsO1913zkGtaY7nygQFLxcExT6oGKwV1DqAXUkJQHyG7TW1i+KYAnmdYimB2r9yUg+Q6KSNQPuk/CQWdOVCDyFzwYluWamt3MySlijSGI6AaVcfcjVVcgQ9RMiJYUvPA8VJNyEfPxUljuSDtiXiZ4tGB9W6JrENB4b/ILQNUVl69ltfYoNjA28PRpKELL2FgSeCXo9y5upgJVVuRqLWOC7Z3k2i3oEegFRZGJl4BKDJogxV0WWWZQVven4zJR0JNkyBcoZvGizM1AdIGV5ZYtONKR99Keq1H4zGvq4+zZfoQAqEpymt2pPAKE8ysJQ/b0JQNe03l+vHgZIDt19uqw1ptozd7ZWBbrWZY6HDhRNU7jXkyTQH9XmfLqCuhfa4YvgFGHYvD4qNNsPgK4YbsRA=; bm_sz=3EC111D1AAFC7A81FB7C455C8F7D5406~YAAQZMQQAvc0gXmYAQAA4bNpfxz6XzBba4CAoZXd00x44TKcWUsACDsvQEb21A5n+nxKdWQ0U6LTo8gdz2pewp2CbhsTf1LdJ9UK4zpOIio3GUagNVfwXio2dKkqAcGJGqKkDj/QqsxUzGxDWzfjMltsBEzbwAXkeQTpU8lREyd9LOiEel5wb5TubnnF6Gbm5hsrkFwboXHDcUbTbl1vd0BQtI08K8CNGfroxHNuffKowYEy68cfbchZ+jMMUAS40zRZYCrQlKNuH4dtaCyAvvSUWSF1aO1wgGYDGhdhyg3QU10F4524Nm5cPRVXfSi6xpoHibWrOA2XuWn3MKfrkpoxYPy+K3qxFfwh3Sv/RoQdonxd6BLeOo47AG3YaBLexc1yER8YCQfiKvDieoXEx34dMnDdZCNZpUSVZkhI+My5tMFCb07nK4XyV2QhPVTVjXYJICOjjJUwXQ==~3684409~3687749; _abck=C9237C1A18F794522826736AA7222223~-1~YAAQJcQQAqtadnCYAQAA67hpfw4Sr4TSZmCezGUvQta7X6nzKnHdJDXYTsJaU/lrCQPmcTMZIAhMYin0hyBE3sXrbQJHKLBfHwMlqb0LySnk288h3LwHaMgdlCkEwaNcM5iXeS/0R+m1ObxOed6gKz8ct7vQgSe/Jf1ezzhMegzahIVje3kUepQKoFeQLGyKk6QPGzZc/OzWyFFy9sB5AAOETNzeK1efUJY9Rro/v1PRbxEHxrtWyaGRElRm224bl0cUm9rGgr1XWknh4lUg3tGazH74/Drwph/xKzSfAJQwauW+Acg6VfPuVf5auOD2iJwHJuOcwdmOykmiuLr1A+dB47n+tWPZ2LeKFu3lIvH8vzowWKW9f0eQ/UuBQ8VB3hgaSiLjiP3utTJzYjw805dfflPO45bqLY+QCL8OVPaT/eaCZnSH45de1xgNTOIYhg0mr5N+xakXSsk2SAK8VNildyt/PxJnUlRXRQ9Cty7ijd6oaL7Idtsdw4NwANkDJrCEAyuGsS8GUYI8/EMeunrg13GIc3oJCqv1cMS5V5fzk10oibAJbaTMnnDl3nkR9pR3AsgAy5nVdJPz9mG1ZkWAk6jYcMGjn8kmZ4PuHEhxdXebw5KS96VxC+hb7h7zmj9cxbHKTB2aGtz2YhAdk0BL0DqwgED978KxSDgDOjl4OnMccskxNQ==~-1~-1~-1; bm_s=YAAQJcQQAqxadnCYAQAA67hpfwMevAj46lHFptONMyzu8D6BqH9fgyY3eKQsIGYpu4ljVGnVvedUHPThXyJNmaqmpf209H65WTdxYf53SlmZ5sT7vuORP6s2Dn6AAOi+m615c9EgMTl7xLl/DaosxYhvapLK5TTQrk2B2xUZSsbQFJ1oahtt/33ACE0hzDbryx/qeOXEoF2NhDyxzeIZcTRtjGZTJv2g6vwvd1RcH/RUPFrqJ6jvLSSHqYGiqOvZ8M6N9w8QNRoqjzdMq8v4n1r8K/Wh2He5eQMLLZOfTXz2sWHwPhKyfgKALBadMTAOHDFkFbUa+tdzSRH3Zz5DZQoTsb7+ZbJxnAsc6+l0SPo7RVWlCb7Na4H4fi1pmpoAg3Z7fPvovDtuaO0cajvrfOzXw6WvDT9XO7U4RPtN713uwKOUs23g7sqfX/MS+UtqgUxgACY5+eVQhOHDFBWNm3SE9JW/Ft0AaaDdEuGEOQUB9uo291Yz8N3mYINAg1uo3aWHof0D7jGslP49TnxyKiZdFRS4gExfEiHQwjrQ7AN/bkNmw1bkFlGjJCBml0r7xO8UeCip6xXCwKnGZw=="
      }
    };

    const response = await axios.get(url, headers);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

app.listen(3000, () => {
  console.log('Scraper rodando em http://localhost:3000');
});
