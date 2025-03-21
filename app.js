// Funkcja do pobrania danych z formularza
function getApiUrlAndKey() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();

    if (!apiUrl || !apiKey) {
        alert("Proszę wprowadzić URL API Kimai i klucz API.");
        return null;
    }

    return { apiUrl, apiKey };
}

// Funkcja do załadowania aktywności
async function loadActivities() {
    const apiData = getApiUrlAndKey();
    if (!apiData) return;

    const { apiUrl, apiKey } = apiData;

    try {
        const response = await fetch(`${apiUrl}/api/activities`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Błąd ładowania aktywności");
        }

        const data = await response.json();
        displayActivities(data);
    } catch (error) {
        console.error(error);
    }
}

// Funkcja do wyświetlenia aktywności w tabeli
function displayActivities(activities) {
    const tableBody = document.querySelector('#activityTable tbody');
    tableBody.innerHTML = ''; // Czyścimy tabelę przed dodaniem nowych danych

    activities.forEach(activity => {
        const row = document.createElement('tr');
        
        const projectCell = document.createElement('td');
        projectCell.textContent = activity.project ? activity.project.name : "Bez projektu";

        const activityCell = document.createElement('td');
        activityCell.textContent = activity.name;

        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edytuj';
        editButton.onclick = () => editActivity(activity.id, activity.name, activity.project?.name);
        editCell.appendChild(editButton);

        row.appendChild(projectCell);
        row.appendChild(activityCell);
        row.appendChild(editCell);

        tableBody.appendChild(row);
    });
}

// Funkcja do edycji aktywności
function editActivity(id, currentName, currentProject) {
    const newName = prompt("Wprowadź nową nazwę aktywności:", currentName);
    const newProject = prompt("Wprowadź nowy projekt (lub zostaw puste dla braku projektu):", currentProject);

    if (newName) {
        updateActivity(id, newName, newProject);
    }
}

// Funkcja do aktualizacji aktywności przez API
async function updateActivity(id, newName, newProject) {
    const apiData = getApiUrlAndKey();
    if (!apiData) return;

    const { apiUrl, apiKey } = apiData;

    const updatedData = {
        name: newName,
        project: newProject ? { name: newProject } : null,
    };

    try {
        const response = await fetch(`${apiUrl}/api/activities/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error("Błąd aktualizacji aktywności");
        }

        alert("Aktywność została zaktualizowana");
        loadActivities(); // Ponownie załaduj aktywności
    } catch (error) {
        console.error(error);
    }
}
