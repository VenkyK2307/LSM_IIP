

// Fetch company data from main.json
fetch('json/main.json')
    .then(response => response.json())
    .then(data => {
        const companyData = data;
        const capabilityDropdown = document.getElementById('capability');
        const companyList = document.getElementById("autocomplete-list");
        const stockChartCtx = document.getElementById('stockChart').getContext('2d');
        let stockData = {};

        // Populate the capability dropdown with the unique capabilities from all companies
        function updateCapabilityDropdown(selectedCompany) {
            const capabilities = companyData.filter(company => company.Name === selectedCompany);
            if (capabilities.length > 0) {
                const capability = capabilities[0].Capability;
                capabilityDropdown.value = capability; // Set selected capability
            }
        }

        // Create the chart
        const stockChart = new Chart(stockChartCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Stock Value by Capability',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Autocomplete function for company name
        const inputField = document.getElementById("company-name");
        const suggestionsList = document.getElementById("autocomplete-list");

        inputField.addEventListener("input", function() {
            const query = inputField.value.toLowerCase();
            if (query.length > 0) {
                const filteredData = companyData.filter(company =>
                    company.Name.toLowerCase().includes(query)
                );

                suggestionsList.innerHTML = "";
                filteredData.forEach(company => {
                    const suggestionItem = document.createElement("div");
                    suggestionItem.classList.add("autocomplete-suggestion");
                    suggestionItem.innerText = company.Name;
                    suggestionItem.addEventListener("click", function() {
                        inputField.value = company.Name;
                        suggestionsList.innerHTML = ""; // Clear suggestions
                        updateCapabilityDropdown(company.Name);
                        displayCompanyInfo(company);
                    });
                    suggestionsList.appendChild(suggestionItem);
                });
            } else {
                suggestionsList.innerHTML = "";
            }
        });

        // Display company info based on selected company
        function displayCompanyInfo(company) {
            document.getElementById("market-cap").textContent = "Market Cap: " + company["Market Cap"];
            document.getElementById("alpha").textContent = "Alpha: " + company["Alpha"];
            document.getElementById("beta").textContent = "Beta: " + company["Beta"];
            document.getElementById("cagr").textContent = "5Y CAGR: " + company["5Y CAGR"];
            document.getElementById("score").textContent = "SCORE: " + company["SCORE"];
        }

        // Handle Add Stock button click
        document.getElementById("add-stock").addEventListener("click", function() {
            const selectedCompanyName = inputField.value.trim();
            const selectedCompany = companyData.find(company => company.Name === selectedCompanyName);
            const quantity = parseInt(document.getElementById("quantity").value);
            const price = parseFloat(document.getElementById("price").value);

            if (selectedCompany && !isNaN(quantity) && !isNaN(price)) {
                const multipliedPrice = quantity * price;
                const capability = selectedCompany.Capability;

                // Add stock value to stockData
                if (!stockData[capability]) {
                    stockData[capability] = 0;
                }
                stockData[capability] += multipliedPrice;

                // Update the chart with the new stock data
                const uniqueCapabilities = Object.keys(stockData);
                stockChart.data.labels = uniqueCapabilities;
                stockChart.data.datasets[0].data = uniqueCapabilities.map(cap => stockData[cap] || 0);
                stockChart.update();
            }
        });
    })
    .catch(error => {
        console.error("Error loading the JSON data:", error);
    });
