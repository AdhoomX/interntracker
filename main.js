"use strict";


const form = document.getElementById("Application-form");
const tableBody = document.getElementById("applications-body");

const companyInput = document.getElementById("company");
const positionInput = document.getElementById("position");
const dateInput = document.getElementById("Application-date");
const statusInput = document.getElementById("status");
const followUpInput = document.getElementById("Follow-up");
const notesInput = document.getElementById("notes");

const searchInput = document.querySelector('.my-app input[type="search"]');
const filterInput = document.getElementById("filter");

const totalCount = document.getElementById("total-count");
const interviewCount = document.getElementById("interview-count");
const acceptedCount = document.getElementById("accepted-count");

const STORAGE_KEY = "interntracker-applications";

const statusLabels = {
    applied: "Applied",
    interview: "Interview",
    accepted: "Accepted",
    rejected: "Rejected"
};

const workTypeLabels = {
    remote: "Remote",
    hybrid: "Hybrid",
    "on-site": "On-site"
};

// Display feedback below the form.
const message = document.createElement("p");
message.setAttribute("role", "status");
message.setAttribute("aria-live", "polite");
form.appendChild(message);

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#B91C1C" : "#166534";
}



class Application {
    constructor(company, position, date, status, workType, followUp, notes) {
        this.id = crypto.randomUUID();
        this.company = company;
        this.position = position;
        this.date = date;
        this.status = status;
        this.workType = workType;
        this.followUp = followUp;
        this.notes = notes;
    }
}



function isValidApplication(item) {
    return (
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.company === "string" &&
        typeof item.position === "string" &&
        typeof item.date === "string" &&
        Object.hasOwn(statusLabels, item.status) &&
        Object.hasOwn(workTypeLabels, item.workType) &&
        typeof item.followUp === "boolean" &&
        typeof item.notes === "string"
    );
}

function loadApplications() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved === null) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed) || !parsed.every(isValidApplication)) {
            throw new Error("Invalid saved application data.");
        }

        return parsed;
    } catch (error) {
        console.error("Loading failed:", error);

        showMessage(
            "Saved applications could not be loaded. Check browser storage before adding new data.",
            true
        );

        return [];
    }
}

let applications = loadApplications();

function saveApplications() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
        return true;
    } catch (error) {
        console.error("Saving failed:", error);

        showMessage(
            "Your change is visible, but could not be saved. It may be lost when you refresh.",
            true
        );

        return false;
    }
}



function updateCounters() {
    totalCount.textContent = applications.length;

    interviewCount.textContent = applications.filter(
        application => application.status === "interview"
    ).length;

    acceptedCount.textContent = applications.filter(
        application => application.status === "accepted"
    ).length;
}



function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
    return cell;
}

function createApplicationRow(application) {
    const row = document.createElement("tr");

    addCell(row, application.company);
    addCell(row, application.position);
    addCell(row, application.date);

    const statusCell = document.createElement("td");
    const statusSelect = document.createElement("select");

    statusSelect.dataset.id = application.id;
    statusSelect.dataset.action = "change-status";

    statusSelect.setAttribute(
        "aria-label",
        `Status for ${application.position} at ${application.company}`
    );

    Object.entries(statusLabels).forEach(([value, label]) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = label;
        statusSelect.appendChild(option);
    });

    statusSelect.value = application.status;
    statusCell.appendChild(statusSelect);
    row.appendChild(statusCell);

    addCell(row, workTypeLabels[application.workType]);

    
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.id = application.id;
    deleteButton.dataset.action = "delete";

    deleteButton.setAttribute(
        "aria-label",
        `Delete ${application.position} at ${application.company}`
    );

    actionsCell.appendChild(deleteButton);

    if (application.notes || application.followUp) {
        const details = document.createElement("details");
        const summary = document.createElement("summary");

        summary.textContent = "Details";
        details.appendChild(summary);

        if (application.followUp) {
            const followUp = document.createElement("p");
            followUp.textContent = "Follow-up needed";
            details.appendChild(followUp);
        }

        if (application.notes) {
            const notes = document.createElement("p");
            notes.textContent = application.notes;
            notes.style.whiteSpace = "pre-wrap";
            details.appendChild(notes);
        }

        actionsCell.appendChild(details);
    }

    row.appendChild(actionsCell);

    return row;
}



function renderApplications() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterInput.value.toLowerCase();

    const visibleApplications = applications.filter(application => {
        const matchesCompany = application.company
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            application.status === selectedStatus;

        return matchesCompany && matchesStatus;
    });

    tableBody.replaceChildren();

    if (visibleApplications.length === 0) {
        const row = document.createElement("tr");
        const cell = addCell(
            row,
            applications.length === 0
                ? "No applications yet. Add your first application above."
                : "No applications match your search or filter."
        );

        cell.colSpan = 6;
        tableBody.appendChild(row);
    } else {
        const fragment = document.createDocumentFragment();

        visibleApplications.forEach(application => {
            fragment.appendChild(createApplicationRow(application));
        });

        tableBody.appendChild(fragment);
    }

    updateCounters();
}



form.addEventListener("submit", event => {
    
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    const company = companyInput.value.trim();
    const position = positionInput.value.trim();
    const date = dateInput.value;
    const status = statusInput.value;
    const notes = notesInput.value.trim();

    const selectedWorkType = form.querySelector(
        'input[name="work-type"]:checked'
    );

    if (!company || !position || !date || !selectedWorkType) {
        showMessage("Please complete all required fields.", true);
        return;
    }

    const workType =
        selectedWorkType.value === "hybride"
            ? "hybrid"
            : selectedWorkType.value;

    if (
        !Object.hasOwn(statusLabels, status) ||
        !Object.hasOwn(workTypeLabels, workType)
    ) {
        showMessage("Please select a valid status and work type.", true);
        return;
    }

    const application = new Application(
        company,
        position,
        date,
        status,
        workType,
        followUpInput.checked,
        notes
    );

    applications.unshift(application);

    const saved = saveApplications();

    form.reset();

    searchInput.value = "";

    const allOption = Array.from(filterInput.options).find(
        option => option.value.toLowerCase() === "all"
    );

    if (allOption) {
        filterInput.value = allOption.value;
    }

    renderApplications();

    if (saved) {
        showMessage(`Application for ${company} added and saved.`);
    }

    companyInput.focus();
});


tableBody.addEventListener("change", event => {
    const select = event.target.closest(
        'select[data-action="change-status"]'
    );

    if (!select) {
        return;
    }

    const application = applications.find(
        item => item.id === select.dataset.id
    );

    if (!application || !Object.hasOwn(statusLabels, select.value)) {
        return;
    }

    application.status = select.value;

    const saved = saveApplications();
    renderApplications();

    if (saved) {
        showMessage(`Status for ${application.company} updated.`);
    }
});



tableBody.addEventListener("click", event => {
    const button = event.target.closest('button[data-action="delete"]');

    if (!button) {
        return;
    }

    const application = applications.find(
        item => item.id === button.dataset.id
    );

    if (!application) {
        return;
    }

    const confirmed = window.confirm(
        `Delete the ${application.position} application at ${application.company}?`
    );

    if (!confirmed) {
        return;
    }

    applications = applications.filter(
        item => item.id !== application.id
    );

    const saved = saveApplications();
    renderApplications();

    if (saved) {
        showMessage(`Application for ${application.company} deleted.`);
    }
});


searchInput.addEventListener("input", renderApplications);
filterInput.addEventListener("change", renderApplications);


renderApplications();