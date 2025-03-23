// app.js

let apiUrl = "";
let apiKey = "";

// Pobranie URL i API Key z formularza
function getApiUrlAndKey() {
    apiUrl = document.getElementById('apiUrl').value.trim();
    apiKey = document.getElementById('apiKey').value.trim();

    if (!apiUrl || !apiKey) {
        alert("Proszę wprowadzić URL API Kimai i klucz API.");
        return false;
    }
    return true;
}

// Załadowanie aktywności z API Kimai
async function loadActivities() {
    if (!getApiUrlAndKey()) return;

    console.log("Pobieranie aktywności z:", apiUrl);
    try {
        const response = await fetch(`${apiUrl}/api/activities`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error("Błąd podczas ładowania aktywności:", response.statusText);
            alert("Błąd podczas ładowania aktywności.");
            return;
        }

        const data = await response.json();
        console.log("Załadowane aktywności:", data);
        displayActivities(data);
    } catch (error) {
        console.error("Wyjątek podczas ładowania aktywności:", error);
    }
}

// Wyświetlenie aktywności w tabeli
function displayActivities(activities) {
    const tableBody = document.querySelector('#activityTable tbody');
    tableBody.innerHTML = ''; // Czyścimy tabelę

    activities.forEach((activity) => {
        const row = document.createElement('tr');
        row.dataset.id = activity.id; // zapisujemy id rekordu

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

        // Akcje (przyciski)
        const actionsCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Usuń';
        deleteButton.onclick = () => deleteRow(activity.id, row);
        actionsCell.appendChild(deleteButton);
        // Przycisk "Zapisz" pojawi się dynamicznie

        row.appendChild(projectCell);
        row.appendChild(activityCell);
        row.appendChild(descriptionCell);
        row.appendChild(billableCell);
        row.appendChild(rateCell);
        row.appendChild(actionsCell);

        // Dodajemy event listener dla zmian w wierszu
        row.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', () => ensureSaveButton(row));
        });

        tableBody.appendChild(row);
    });
}

// Tworzenie pola wyboru projektu
function createProjectSelect(selectedProject) {
    const select = document.createElement('select');
    select.className = 'form-select';
    const projects = ["Projekt A", "Projekt B", "Bez projektu"];

    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        if (project === selectedProject) option.selected = true;
        select.appendChild(option);
    });

    return select;
}

// Tworzenie edytowalnego inputa
function createEditableInput(value) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'form-control';
    return input;
}

// Tworzenie checkboxa dla Billable
function createBillableCheckbox(checked) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    return checkbox;
}

// Usuwanie rekordu (API i UI)
async function deleteRow(activityId, rowElement) {
    console.log(`Próba usunięcia rekordu o id: ${activityId}`);
    try {
        const response = await fetch(`${apiUrl}/api/activities/${activityId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.error("Błąd podczas usuwania rekordu:", response.statusText);
            alert("Błąd podczas usuwania rekordu.");
            return;
        }
        console.log(`Rekord ${activityId} został usunięty.`);
        rowElement.remove();
    } catch (error) {
        console.error("Wyjątek podczas usuwania rekordu:", error);
    }
}

// Zapisywanie zmian w wierszu
async function saveRow(row) {
    const id = row.dataset.id;
    const cells = row.children;
    const data = {
        project: cells[0].querySelector('select').value,
        name: cells[1].querySelector('input').value,
        description: cells[2].querySelector('input').value,
        billable: cells[3].querySelector('input').checked,
        rate: cells[4].querySelector('input').value,
    };

    try {
        let response;
        if (id) {
            console.log(`Aktualizacja rekordu ${id}:`, data);
            response = await fetch(`${apiUrl}/api/activities/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } else {
            console.log("Tworzenie nowego rekordu:", data);
            response = await fetch(`${apiUrl}/api/activities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        }
        if (!response.ok) {
            console.error("Błąd podczas zapisywania rekordu:", response.statusText);
            alert("Błąd podczas zapisywania rekordu.");
            return;
        }
        const result = await response.json();
        console.log("Zapisano rekord:", result);
        if (!id && result.id) {
            row.dataset.id = result.id;
        }
        removeSaveButton(row);
    } catch (error) {
        console.error("Wyjątek podczas zapisywania rekordu:", error);
    }
}

// Dodaje przycisk "Zapisz", jeśli jeszcze nie istnieje
function ensureSaveButton(row) {
    const actionsCell = row.lastElementChild;
    if (!actionsCell.querySelector('.btn-save')) {
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-primary btn-sm btn-save';
        saveButton.textContent = 'Zapisz';
        saveButton.style.marginLeft = '5px';
        saveButton.onclick = () => saveRow(row);
        actionsCell.appendChild(saveButton);
    }
}

// Usuwa przycisk "Zapisz"
function removeSaveButton(row) {
    const actionsCell = row.lastElementChild;
    const saveButton = actionsCell.querySelector('.btn-save');
    if (saveButton) saveButton.remove();
}

// Dodawanie nowego pustego wiersza
function addRow() {
    const tableBody = document.querySelector('#activityTable tbody');
    const newRow = document.createElement('tr');
    // Brak id – nowy rekord

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
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Usuń';
    deleteButton.onclick = () => {
        console.log("Usuwanie wiersza z UI (rekord nie zapisany w bazie)");
        newRow.remove();
    };
    actionsCell.appendChild(deleteButton);

    newRow.appendChild(projectCell);
    newRow.appendChild(activityCell);
    newRow.appendChild(descriptionCell);
    newRow.appendChild(billableCell);
    newRow.appendChild(rateCell);
    newRow.appendChild(actionsCell);

    // Monitoruj zmiany, aby dodać przycisk "Zapisz"
    newRow.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', () => ensureSaveButton(newRow));
    });

    tableBody.appendChild(newRow);
}

// Załaduj dane przy starcie
loadActivities();
