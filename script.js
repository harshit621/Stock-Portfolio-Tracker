const portfolio = [];
const apiKey = 'SADH5RIWRCXCQX3O'; // Stock API key
const newsApiKey = '32e29c8a2bb94269824b0057c8693fdf'; // News API key
const date = new Date();

// console.log(year);

// DOM 
const portfolioList = document.getElementById('portfolioList');
const stockPrices = document.getElementById('stockPrices');
const newsSection = document.getElementById('news');
const comparisonChartCtx = document.getElementById('comparisonChart').getContext('2d');

// Chart
let comparisonChart = new Chart(comparisonChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false
      }
    }
  }
});

// Add Stock 
function addStock() {
  const symbol = document.getElementById('stockSymbol').value.toUpperCase();
  if (symbol && !portfolio.includes(symbol)) {
    portfolio.push(symbol);
    updatePortfolioList();
    fetchStockData(symbol);
    fetchNews(symbol);
    autoComplete(symbol);
  }
  document.getElementById('stockSymbol').value = '';
}

// Update Portfolio 
function updatePortfolioList() {
  portfolioList.innerHTML = portfolio.map(symbol => `<li>${symbol} <button onclick="removeStock('${symbol}')">Remove</button></li>`).join('');
}
function updateStockPrices(symbol) {
  let elem = document.getElementsByClassName(symbol);
  console.log(elem);
  elem[0].remove();
}

// Remove Stock 
function removeStock(symbol) {
  const index = portfolio.indexOf(symbol);
  const divSelect = document.getElementsByClassName("")
  if (index !== -1) {
    portfolio.splice(index, 1);
    updatePortfolioList();
    updateStockPrices(symbol);
    // chart update
    updateComparisonChart(symbol, closeArray, remove)

  }
}
// auto complete
async function autoComplete(symbol) {
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${apiKey}`;
  const data = await axios.get(url);
  console.log(data);
}

// Fetch Stock Data
async function fetchStockData(symbol) {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
  try {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
// console.log(date);
// console.log(y);
// console.log(m);
// console.log(d);
    // const curr = ;
    const response = await axios.get(url);
    let datas;
    // "Time Series (Daily)": {
    //   "2025-02-07": {
    //       "1. open": "255.2800",
    //       "2. high": "256.9300",
    //       "3. low": "252.0200",
    //       "4. close": "252.3400",
    //       "5. volume": "3370284"
    //   },
    const temporary = response
    console.log(temporary);
    if(d - 3 < 10) {
      datas = response.data["Time Series (Daily)"][y + "-0" + m + "-0" + (d - 3)]
    } else {
      datas = response.data["Time Series (Daily)"][y + "-0" + m + "-" + (d - 3)]
    }
    
    let arr = [response.data["Time Series (Daily)"]];
    let ans = arr.map(object => Object.values(object));
    console.log(arr);
    console.log(ans);
    console.log(ans[0][0]);
    const closeArray = [];
    for(let i = 0; i < ans[0].length; i++) {
      closeArray.push(parseFloat(ans[0][i]["4. close"]));
    }
    console.log(closeArray);
    

    // let obj = datas;


    // const value = data.map(obj => Object.values(obj));
    // console.log(value);


    // const latestPrice = data[latestDate]['4. close'];
    // const previousDate = Object.keys(data)[1];
    const open = datas["1. open"];
    const close = datas["4. close"];

    // let latestPrice = 0;
    // let previousPrice = 0;
   
    displayStockPrice(symbol, open, close);
    updateComparisonChart(symbol, closeArray);
  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}

// Display Stock Price
function displayStockPrice(symbol, open, close) {
  const priceChange = (open - close).toFixed(2);
  const changePercent = ((priceChange / close) * 100).toFixed(2);
  const card = document.createElement('div');
  card.className = symbol; // stock-card
  card.style = "background: #ecf0f1; padding: 15px; border-radius: 8px;width: 200px; text-align: center;"
  card.innerHTML = `
    <h3>${symbol}</h3>
    <p>$${open}</p>
    <p style="color: ${priceChange >= 0 ? 'green' : 'red'};">${priceChange} (${changePercent}%)</p>
  `;
  stockPrices.appendChild(card);
}

// Update Comparison Chart
function updateComparisonChart(symbol, closeArray) {
  if (symbol) {
    const dataset = comparisonChart.data.datasets.find(d => d.label === symbol);
    if (dataset) {
      const arr = [];
      for(let i = 0; i < closeArray.length; i++) {
        dataset.data.push(closeArray[i]);
      }
      // dataset.data.push(open);
    } else {
      const temArr = closeArray;
      // for(let i = 0; i < closeArray.length; i++) {
      //   push(closeArray[i]);
      // }
      comparisonChart.data.datasets.push({
        label: symbol,
        data: closeArray,
        borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        fill: false
      });
    }
    comparisonChart.data.labels.push(new Date().toLocaleTimeString());
    comparisonChart.update();
  }
}

// Fetch News
async function fetchNews(symbol) {
  const url = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${newsApiKey}`;
  try {
    const response = await axios.get(url);
    const articles = response.data.articles.slice(0, 5);
    console.log(articles);

    displayNews(articles);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

// Display News
function displayNews(articles) {
  newsSection.innerHTML = articles.map(article => `
    <div class="news-card">
      <h3>${article.title}</h3>
      <p>${article.description}</p>
      <a href="${article.url}" target="_blank">Read more</a>
    </div>
  `).join('');
}

// Init
function init() {
  portfolio.forEach(symbol => fetchStockData(symbol));
}

init();