"use strict";
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
console.log(form, companyInput,positionInput,statusInput,notesInput, tableBody);

class Application {
    constructor(company, position, date, status, workType, followUp,notes){
        this.id = crypto.randomUUID();
        this.company=company;
        this.position=position;
        this.date=date;
        this.status=status;
        this.workType=workType;
        this.followUp=followUp;
        this.notes=notes;
    }
    getSummary(){
        returnd`${this.position} at ${this.company}`;
    }
}
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
    const application = new Application(
        company,
        position,
        date,
        status,
        workType,
        followUp,
        notes,
    );
    applications.push(application);
    console.log(applications);
    saveApplications();
    searchInput.value = "";
    filterInput.value = "All";
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
    saveApplications();
    renderApplications();
}
function saveApplications() {
    try {
        const data = JSON.stringify(applications);
        localStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
        console.error("saving failed", error);
        alert("your changes could not be saved.");
    }
}
function loadApplications() { //using try and catch to save and load applications
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data === null) {
            return [];
        }
        const parsed = JSON.parse(data);
        const valid = Array.isArray(parsed) && parsed.every(function (item) {
            return (
                item !== null &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                typeof item.company === "string" &&
                typeof item.position === "string" &&
                typeof item.date === "string" &&
                typeof item.status === "string" &&
                typeof item.workType === "string"
            );
        });
        if (!valid) {
            throw new Error("Invalid saved applications.");
        }
        return parsed;
    } catch (error) {
        console.error("Loading failed:", error);
        alert("Saved applications could not be loaded.");
        return [];
    }
};
applications = loadApplications();
renderApplications();
const tipText = document.getElementById("career-tip");
const tipButton = document.getElementById("tip-button");
async function loadCareerTip(){
    tipButton.disabled = true;
    try{
        const response = await fetch("./tips.json");
        if(!response.ok){
            throw new Error(`Request failed: ${response.status}`);
        }
        const tips = await response.json();
        if (
            !Array.isArray(tips)||
            tips.length===0 ||
            !tips.every(tip => typeof tip ==="string")
        ){
            throw new Error("Invalid tips data");
        }
        const index = Math.floor(Math.random() * tips.length);
        tipText.textContent = tips[index];
    } catch (error) {
        console.error("Could not load tips:", error);
        tipText.textContent = "Could not load a tip. Please try again.";
    } finally {
        tipButton.disabled = false;
    }   
}
tipButton.addEventListener("click", loadCareerTip);
