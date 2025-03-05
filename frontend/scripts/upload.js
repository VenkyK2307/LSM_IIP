
// Function to fetch the JSON data and populate the stock name list and handle the rest
let stockData = [];
fetch('json/main.json') 
    .then(response => response.json())
    .then(data => {
        stockData = data;
        populateStockList();
    })
    .catch(error => console.error("Error fetching data: ", error));

// Populate the datalist with stock names from JSON
function populateStockList() {
    const stockList = document.getElementById('stock-list');
    stockData.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.Name;
        // stockList.appendChild(option);
    });
}

// Add stock entry functionality
document.getElementById('add-stock-btn').addEventListener('click', function() {
    const stockEntry = document.createElement('div');
    stockEntry.classList.add('stock-entry');
    stockEntry.innerHTML = `
        <input type="text" class="form-control stock-name" placeholder="Stock Name" list="stock-list" required>
        <input type="number" class="form-control quantity" placeholder="Quantity" required>
        <input type="number" class="form-control avg-cost" placeholder="Avg Purchase Cost" required>
        <button class="remove-btn">X</button>
    `;
    document.getElementById('stocks-container').appendChild(stockEntry);

    // Add remove button functionality
    stockEntry.querySelector('.remove-btn').addEventListener('click', function() {
        stockEntry.remove();
    });
});

// Submit portfolio and show popup
document.getElementById('submit-btn').addEventListener('click', function() {
    const stocks = [];
    const stockEntries = document.querySelectorAll('.stock-entry');
    stockEntries.forEach(function(entry) {
        const stockName = entry.querySelector('.stock-name').value;
        const quantity = entry.querySelector('.quantity').value;
        const avgCost = entry.querySelector('.avg-cost').value;
        
        // Find stock details by name from stockData
        const stockDetails = stockData.find(stock => stock.Name === stockName);
        if (stockDetails) {
            const capability = stockDetails.Capability;
            const amount = avgCost * quantity; 
            

            // Add stock data along with capability and calculated amount
            stocks.push({ stockName, quantity, avgCost, capability, amount });
        }
    });

    // Populate the popup table
    const tableBody = document.getElementById('stock-table-body');
    tableBody.innerHTML = '';
    stocks.forEach(function(stock) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stock.stockName}</td>
            <td>${stock.quantity}</td>
            <td>${stock.avgCost}</td>
            <td>${stock.amount}</td>
       
        `;
        tableBody.appendChild(row);
    });

    // Show the popup
    document.getElementById('stocks-popup').style.display = 'flex';

    // Now generate charts based on the stocks array (we'll split the amounts based on capability)
    generateChart(stocks);
});

// Function to generate a chart showing amount distribution based on stock capabilities


// Close popup
function closePopup() {
    document.getElementById('stocks-popup').style.display = 'none';
}

// Save portfolio (placeholder)
function savePortfolio() {
    alert("Portfolio saved!");
    closePopup();
}
