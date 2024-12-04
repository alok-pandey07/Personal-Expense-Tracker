document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const incomeForm = document.getElementById("income-form");
    const expenseList = document.getElementById("expense-list");
    const incomeList = document.getElementById("income-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");
    const circleGraph = document.getElementById("circle-graph");

    let expenses = [];
    let income = [];
    let expenseCategories = {
        Food: 0,
        Transport: 0,
        Entertainment: 0,
        Other: 0
    };

    let totalIncome = 0;
    let isIncomeSet = false; // Flag to check if income is set

    // Handle income form submission
    incomeForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("income-name").value;
        const amount = parseFloat(document.getElementById("income-amount").value);
        const date = document.getElementById("income-date").value;

        if (!amount || !name || !date) return; // Simple validation

        totalIncome += amount;
        isIncomeSet = true; // Set the flag when income is added
        const incomeItem = { id: Date.now(), name, amount, date };

        income.push(incomeItem);
        displayIncome();
        updateTotalAmount();
        updateCircleGraph();
        incomeForm.reset();
    });

    // Handle expense form submission only if income is set
    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!isIncomeSet) {
            alert("Please add income before adding expenses.");
            return; // Don't add expense if income is not set
        }

        const name = document.getElementById("expense-name").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;

        if (!amount || !name || !category || !date) return; // Simple validation

        const expense = { id: Date.now(), name, amount, category, date };

        expenses.push(expense);
        expenseCategories[category] += amount; // Update category expense
        displayExpenses();
        updateTotalAmount();
        updateCircleGraph();
        expenseForm.reset();
    });

    // Display income list in table
    function displayIncome() {
        incomeList.innerHTML = "";
        income.forEach((incomeItem) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${incomeItem.name}</td>
                <td>${incomeItem.amount}</td>
                <td>${incomeItem.date}</td>
                <td><button class="delete-btn" onclick="deleteIncome(${incomeItem.id})">Delete</button></td>
            `;
            incomeList.appendChild(row);
        });
    }

    // Delete income item
    window.deleteIncome = function (id) {
        income = income.filter((incomeItem) => incomeItem.id !== id);
        totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
        isIncomeSet = totalIncome > 0; // Check if income is still set after deletion
        displayIncome();
        updateTotalAmount();
        updateCircleGraph();
    };

    // Display expense list in table
    function displayExpenses() {
        expenseList.innerHTML = "";
        expenses.forEach((expenseItem) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expenseItem.name}</td>
                <td>${expenseItem.amount}</td>
                <td>${expenseItem.category}</td>
                <td>${expenseItem.date}</td>
                <td><button class="delete-btn" onclick="deleteExpense(${expenseItem.id})">Delete</button></td>
            `;
            expenseList.appendChild(row);
        });
    }

    // Delete expense item
    window.deleteExpense = function (id) {
        const expenseItem = expenses.find((expense) => expense.id === id);
        if (expenseItem) {
            expenses = expenses.filter((expense) => expense.id !== id);
            expenseCategories[expenseItem.category] -= expenseItem.amount; // Decrease category expense
            displayExpenses();
            updateTotalAmount();
            updateCircleGraph();
        }
    };

    // Update total amount
    function updateTotalAmount() {
        const totalExpense = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        const remainingIncome = totalIncome - totalExpense;
        totalAmount.innerHTML = `
            <strong>Total Income:</strong> ₹${totalIncome.toFixed(2)} <br>
            <strong>Total Expenses:</strong> ₹${totalExpense.toFixed(2)} <br>
            <strong>Remaining Income:</strong> ₹${remainingIncome.toFixed(2)} <br>
        `;
    }

    // Update circle graph based on the expense distribution
    function updateCircleGraph() {
        if (!isIncomeSet) return; // Do not update graph if no income is set

        const expenseData = {
            Food: expenseCategories.Food,
            Transport: expenseCategories.Transport,
            Entertainment: expenseCategories.Entertainment,
            Other: expenseCategories.Other
        };

        const totalExpense = Object.values(expenseData).reduce((acc, val) => acc + val, 0);

        // If no expenses, reset the graph to 0%
        if (totalExpense === 0) {
            return;
        }

        const data = {
            labels: ["Food", "Transport", "Entertainment", "Other"],
            datasets: [{
                data: [
                    (expenseData.Food / totalExpense) * 100,
                    (expenseData.Transport / totalExpense) * 100,
                    (expenseData.Entertainment / totalExpense) * 100,
                    (expenseData.Other / totalExpense) * 100
                ],
                backgroundColor: ["#ff6f61", "#4caf50", "#ff9800", "#2196f3"],
                borderColor: ["#ff6f61", "#4caf50", "#ff9800", "#2196f3"],
                borderWidth: 1
            }]
        };

        const ctx = circleGraph.getContext("2d");

        // Clear the previous chart before creating a new one
        if (window.chartInstance) {
            window.chartInstance.destroy();
        }

        // Create a new pie chart
        window.chartInstance = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ": " + tooltipItem.raw.toFixed(2) + "%";
                            }
                        }
                    }
                }
            }
        });
    }

    // Filter expenses by category
    filterCategory.addEventListener("change", (e) => {
        const selectedCategory = e.target.value;
        if (selectedCategory === "All") {
            displayExpenses();
        } else {
            const filteredExpenses = expenses.filter((expense) => expense.category === selectedCategory);
            expenseList.innerHTML = "";
            filteredExpenses.forEach((expenseItem) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${expenseItem.name}</td>
                    <td>${expenseItem.amount}</td>
                    <td>${expenseItem.category}</td>
                    <td>${expenseItem.date}</td>
                    <td><button class="delete-btn" onclick="deleteExpense(${expenseItem.id})">Delete</button></td>
                `;
                expenseList.appendChild(row);
            });
        }
    });
});




//////////////////////////
document.addEventListener("DOMContentLoaded", () => {
    const circleGraph = document.getElementById("circle-graph");

    function updateCircleGraph() {
        if (!window.chartInstance) {
            const ctx = circleGraph.getContext("2d");
            window.chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ["Food", "Transport", "Entertainment", "Other"],
                    datasets: [{
                        data: [25, 25, 25, 25], // Example data; replace with actual values
                        backgroundColor: ["#ff6f61", "#4caf50", "#ff9800", "#2196f3"]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    }
                }
            });
        } else {
            // Update data logic goes here
        }
    }

    updateCircleGraph();
});

