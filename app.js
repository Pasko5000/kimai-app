// app.js

let apiUrl = "";
let apiKey = "";

// Funkcja do pobrania URL i API Key z formularza
function getApiUrlAndKey() {
    apiUrl = document.getElementById('apiUrl').value.trim();
    apiKey = document.getElementById('apiKey').value.trim();

    if (!apiUrl || !apiKey) {
        alert("Proszę wprowadzić URL API Kimai i klucz API.");
        return false;
    }
    return true;
}

// Funkcja do załadowania aktywności z API Kimai
async function loadActivities() {
    if (!getApiUrlAndKey()) return;

    const response = await fetch(`${apiUrl}/api/activities`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        alert("Błąd podczas ładowania aktywności.");
        return;
    }

    const data = await response.json();
    displayActivities(data);
}

// Funkcja do wyświetlenia aktywności w tabeli
function displayActivities(activities) {
    const tableBody = document.querySelector('#activityTable tbody');
    tableBody.innerHTML = ''; // Czyścimy tabelę przed dodaniem nowych danych

    activities.forEach((activity, index) => {
        const row = document.createElement('tr');

        // Projekt (select)
        const projectCell = document.createElement('td');
        const projectSelect = createProjectSelect(activity.project || "Bez projektu");
        projectCell.appendChild(projectSelect);

        // Aktywność (input)
        const activityCell = document.createElement('td');
        const activityInput = createEditableInput(activity.name);
        activityCell.appendChild(activityInput);

        // Opis (input)
        const descriptionCell = document.createElement('td');
        const descriptionInput = createEditableInput(activity.description || "");
        descriptionCell.appendChild(descriptionInput);

        // Billable (checkbox)
        const billableCell = document.createElement('td');
        const billableCheckbox = createBillableCheckbox(activity.billable || false);
        billableCell.appendChild(billableCheckbox);

        // Stawka (input)
        const rateCell = document.createElement('td');
        const rateInput = createEditableInput(activity.rate || "");
        rateCell.appendChild(rateInput);

        // Akcje (przycisk usuwania)
        const actionsCell = document.createElement('td');
        const deleteButton = createDeleteButton(index);
        actionsCell.appendChild(deleteButton);

        // Dodanie komórek do wiersza
        row.appendChild(projectCell);
        row.appendChild(activityCell);
        row.appendChild(descriptionCell);
        row.appendChild(billableCell);
        row.appendChild(rateCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}

// Funkcja do tworzenia pola wyboru projektu
function createProjectSelect(selectedProject) {
    const select = document.createElement('select');
    select.className = 'form-select';
    const projects = ["Projekt A", "Projekt B", "Bez projektu"]; // Można to zmienić na dynamiczne projekty

    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        if (project === selectedProject) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}

// Funkcja do tworzenia edytowalnego inputa
function createEditableInput(value) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'form-control';
    return input;
}

// Funkcja do tworzenia checkboxa dla Billable
function createBillableCheckbox(checked) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    return checkbox;
}

// Funkcja do tworzenia przycisku usuwania
function createDeleteButton(index) {
    const button = document.createElement('button');
    button.className = 'btn btn-danger btn-sm';
    button.textContent = 'Usuń';
    button.onclick = () => deleteRow(index);
    return button;
}

// Funkcja do usuwania wiersza
function deleteRow(index) {
    const tableBody = document.querySelector('#activityTable tbody');
    tableBody.deleteRow(index);
}

// Funkcja do dodawania nowego pustego wiersza
function addRow() {
    const tableBody = document.querySelector('#activityTable tbody');
    const newRow = document.createElement('tr');

    // Nowe komórki (puste)
    const projectCell = document.createElement('td');
    const projectSelect = createProjectSelect("Bez projektu");
    projectCell.appendChild(projectSelect);

    const activityCell = document.createElement('td');
    const activityInput = createEditableInput('');
    activityCell.appendChild(activityInput);

    const descriptionCell = document.createElement('td');
    const descriptionInput = createEditableInput('');
    descriptionCell.appendChild(descriptionInput);

    const billableCell = document.createElement('td');
    const billableCheckbox = createBillableCheckbox(false);
    billableCell.appendChild(billableCheckbox);

    const rateCell = document.createElement('td');
    const rateInput = createEditableInput('');
    rateCell.appendChild(rateInput);

    const actionsCell = document.createElement('td');
    const deleteButton = createDeleteButton(tableBody.rows.length);
    actionsCell.appendChild(deleteButton);

    // Dodanie komórek do wiersza
    newRow.appendChild(projectCell);
    newRow.appendChild(activityCell);
    newRow.appendChild(descriptionCell);
    newRow.appendChild(billableCell);
    newRow.appendChild(rateCell);
    newRow.appendChild(actionsCell);

    tableBody.appendChild(newRow);
}

// Załaduj dane przy starcie
loadActivities();
