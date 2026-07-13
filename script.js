const expenseTable = document.getElementById('expense-table');
const totalExpenseDisplay = document.getElementById('total-expense');
const categoryFilter = document.getElementById('category-filter');
const addExpenseButton = document.getElementById('add-expense');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingExpenseId = null;
let deletingExpenseId = null;

// Update UI to reflect expenses from local storage
function updateUI() {
    expenseTable.innerHTML = '';
    let total = 0;

    if (expenses.length === 0) {
        const emptyMessageRow = document.createElement('tr');
        emptyMessageRow.innerHTML = `<td colspan='5' class='empty-table-message'>No expenses recorded.</td>`;
        expenseTable.appendChild(emptyMessageRow);
    } else {
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${expense.name}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${expense.date}</td>
            <td>
            <button class='edit-btn' onclick='openEditModal(${expense.id})'>Edit</button>
            <button class='delete-btn' onclick='openDeleteModal(${expense.id})'>Delete</button>
            </td>`;
            expenseTable.appendChild(row);
            total += expense.amount;
        });
    }
    totalExpenseDisplay.textContent = total.toFixed(2);
}

// Check if inputs are valid and enable the "Add Expense" button
function checkInputs() {
    if (expenseName.value.trim() && expenseAmount.value && expenseCategory.value && expenseDate.value) {
        addExpenseButton.disabled = false;
    } else {
        addExpenseButton.disabled = true;
    }
}
// Event listener for input fields to check if button should be enabled
[expenseName, expenseAmount, expenseCategory, expenseDate].forEach(input => {
    input.addEventListener('input', checkInputs);
});

// Add expense to the table and local storage
addExpenseButton.addEventListener('click', () => {
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }
    const expense = { id: Date.now(), name, amount, category, date };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    expenseName.value = '';
    expenseAmount.value = '';
    expenseCategory.value = '';
    expenseDate.value = '';
    addExpenseButton.disabled = true;

    updateUI();
});

// Open the edit modal and populate the fields
function openEditModal(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    document.getElementById('edit-expense-name').value = expense.name;
    document.getElementById('edit-expense-amount').value = expense.amount;
    document.getElementById('edit-expense-category').value = expense.category;
    document.getElementById('edit-expense-date').value = expense.date;

    editingExpenseId = id;
    openModal('edit-modal');
}
// Save the edited expense
document.getElementById('confirm-edit').addEventListener('click', () => {
    const name = document.getElementById('edit-expense-name').value.trim();
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const category = document.getElementById('edit-expense-category').value;
    const date = document.getElementById('edit-expense-date').value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }
    const index = expenses.findIndex(exp => exp.id === editingExpenseId);
    if (index > -1) {
        expenses[index] = { id: editingExpenseId, name, amount, category, date };
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
    }
    closeModal('edit-modal');
});

// Open the delete confirmation modal
function openDeleteModal(id) {
    deletingExpenseId = id;
    openModal('delete-modal');

}
// Confirm and delete the expense
document.getElementById('confirm-delete').addEventListener('click', () => {
    expenses = expenses.filter(exp => exp.id !== deletingExpenseId);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
    closeModal('delete-modal');
});

// Open modal by ID
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';

}
// Close modal by ID
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';

}
// Filter expenses by category
categoryFilter.addEventListener('change', () => {
    const filterValue = categoryFilter.value;
    if (filterValue !== 'All') {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.filter(exp => exp.category === filterValue);
    } else {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    } updateUI();
});

// Initial UI update
updateUI();