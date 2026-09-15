"use strict"
// for forms
const form = document.getElementById("Application-form");
const companyInput = document.getElementById("company");
const positionInput = document.getElementById("position");
const dateInput = document.getElementById("Application-date");
const statusInput = document.getElementById("status");
const followUpInput = document.getElementById("Follow-up");
const notesInput = document.getElementById("notes");
const totalCount = document.getElementById("total-count");
const interviewCount = document.getElementById("interview-count");
const acceptedCount = document.getElementById("accepted-count");
//table, search, and filter
const tableBody = document.getElementById("applications-body");
const searchInput = document.querySelector('.my-app input[type="search"]');
const filterInput = document.getElementById("filter");
const STORAGE_KEY = "interntracker-applications";
let applications = [];
console.log(form, companyInput, tableBody);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    const company = companyInput.value.trim();
    const position = positionInput.value.trim();
    const date = dateInput.value;
    const status = statusInput.value;
    const notes = notesInput.value.trim();
    const followUp = followUpInput.checked;
    const selectedWorkType = form.querySelector('input[name="work-type"]:checked');

    if (!selectedWorkType) {
        console.log("Please select a work type.");
        return;
    }
    const workType = selectedWorkType.value
    console.log(company, position, date, status, notes, followUp, workType);

    if (!company || !position || !date) {
        alert("please fill in the company ,position, and date.");
        return;
    };
    const application = {
        id: crypto.randomUUID,
        company: company,
        position: position,
        date: date,
        status: status,
        workType: selectedWorkType.value,
        followUp: followUp,
        notes: notes
    };
    applications.push(application);
    console.log(applications);
    renderApplications();
    form.reset();
});
function renderApplications() {
    tableBody.replaceChildren();
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = filterInput.value.toLowerCase();
    const visibleApplications = applications.filter(function (application) {
        const matchesCompany = application.company
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            application.status === selectedStatus;

        return matchesCompany && matchesStatus;
    });
    visibleApplications.forEach(function (application) {
        const row = document.createElement("tr");
        const values = [
            application.company,
            application.position,
            application.date,
            application.status,
            application.workType
        ];

        values.forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteApplication(application.id);
        });

        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);

    });
    updateCounters();
}
function updateCounters() {
    totalCount.textContent = applications.length;
    interviewCount.textContent = applications.filter(function (application) {
        return application.status === "interview";
    }).length
    acceptedCount.textContent = applications.filter(function (application) {
        return application.status === "accepted";
    }).length

}
searchInput.addEventListener("input", renderApplications);
filterInput.addEventListener("change", renderApplications);
function deleteApplication(id) {
    applications = applications.filter(function (application) {
        return application.id !== id;
    });

    renderApplications();
}
