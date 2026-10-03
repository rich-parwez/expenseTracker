const expenseTable = document.getElementById('expense-table');
const totalExpenseDisplay = document.getElementById('total-expense');
const categoryFilter = document.getElementById('category-filter');
const addExpenseButton = document.getElementById('add-expense');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');

const storageKey = 'expenses';
let allExpenses = JSON.parse(localStorage.getItem(storageKey)) || [];
let editingExpenseId = null;
let deletingExpenseId = null;

function getVisibleExpenses() {
    const filterValue = categoryFilter.value;
    if (filterValue === 'All') {
        return allExpenses;
    }

    return allExpenses.filter(expense => expense.category === filterValue);
}

function renderTable() {
    expenseTable.innerHTML = '';
    const visibleExpenses = getVisibleExpenses();
    let total = 0;

    if (visibleExpenses.length === 0) {
        const emptyMessageRow = document.createElement('tr');
        emptyMessageRow.innerHTML = "<td colspan='5' class='empty-table-message'>No expenses recorded.</td>";
        expenseTable.appendChild(emptyMessageRow);
        totalExpenseDisplay.textContent = '$0.00';
        return;
    }

    visibleExpenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(expense.name)}</td>
            <td>$${Number(expense.amount).toFixed(2)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>${formatDate(expense.date)}</td>
            <td>
                <button class='edit-btn' type='button' onclick='openEditModal(${expense.id})'>Edit</button>
                <button class='delete-btn' type='button' onclick='openDeleteModal(${expense.id})'>Delete</button>
            </td>
        `;
        expenseTable.appendChild(row);
        total += Number(expense.amount);
    });

    totalExpenseDisplay.textContent = `$${total.toFixed(2)}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function persistExpenses() {
    localStorage.setItem(storageKey, JSON.stringify(allExpenses));
}

function checkInputs() {
    const nameValid = expenseName.value.trim().length > 0;
    const amountValid = Number(expenseAmount.value) > 0;
    const categoryValid = !!expenseCategory.value;
    const dateValid = !!expenseDate.value;

    addExpenseButton.disabled = !(nameValid && amountValid && categoryValid && dateValid);
}

[expenseName, expenseAmount, expenseCategory, expenseDate].forEach(input => {
    input.addEventListener('input', checkInputs);
    input.addEventListener('change', checkInputs);
});

addExpenseButton.addEventListener('click', () => {
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || Number.isNaN(amount) || amount <= 0 || !category || !date) {
        alert('Please fill in all fields with a valid amount.');
        return;
    }

    const expense = { id: Date.now(), name, amount, category, date };
    allExpenses.push(expense);
    persistExpenses();

    expenseName.value = '';
    expenseAmount.value = '';
    expenseCategory.value = '';
    expenseDate.value = '';
    addExpenseButton.disabled = true;

    renderTable();
});

function openEditModal(id) {
    const expense = allExpenses.find(exp => exp.id === id);
    if (!expense) return;

    const editName = document.getElementById('edit-expense-name');
    const editAmount = document.getElementById('edit-expense-amount');
    const editCategory = document.getElementById('edit-expense-category');
    const editDate = document.getElementById('edit-expense-date');

    editName.value = expense.name;
    editAmount.value = expense.amount;
    editCategory.value = expense.category;
    editDate.value = expense.date;

    editingExpenseId = id;
    openModal('edit-modal');
}

document.getElementById('confirm-edit').addEventListener('click', () => {
    const name = document.getElementById('edit-expense-name').value.trim();
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const category = document.getElementById('edit-expense-category').value;
    const date = document.getElementById('edit-expense-date').value;

    if (!name || Number.isNaN(amount) || amount <= 0 || !category || !date) {
        alert('Please fill in all fields with a valid amount.');
        return;
    }

    const index = allExpenses.findIndex(exp => exp.id === editingExpenseId);
    if (index > -1) {
        allExpenses[index] = { id: editingExpenseId, name, amount, category, date };
        persistExpenses();
        renderTable();
    }

    closeModal('edit-modal');
});

function openDeleteModal(id) {
    deletingExpenseId = id;
    openModal('delete-modal');
}

document.getElementById('confirm-delete').addEventListener('click', () => {
    allExpenses = allExpenses.filter(exp => exp.id !== deletingExpenseId);
    persistExpenses();
    renderTable();
    closeModal('delete-modal');
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

categoryFilter.addEventListener('change', renderTable);

renderTable();