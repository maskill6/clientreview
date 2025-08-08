// scripts.js (Client Rating Tool)

const BASE_URL = "https://maskill6.github.io/clientreview.html";

function generateLink() {
  const clientName = document.getElementById("clientName").value.trim();
  const jobOrder = document.getElementById("jobOrder").value.trim();
  const coordinatorEmail = document.getElementById("coordinatorEmail").value.trim();
  const employeeList = document.getElementById("employeeList").value.trim().split("\n").map(name => name.trim()).filter(Boolean);

  if (!clientName || !jobOrder || !coordinatorEmail || employeeList.length === 0) {
    alert("Please fill in all fields and at least one employee name.");
    return;
  }

  const clientKey = `${clientName}_${jobOrder}`.replace(/\s+/g, "_");

  const sessionData = {
    clientName,
    jobOrder,
    coordinatorEmail,
    employeeList
  };

  localStorage.setItem(clientKey, JSON.stringify(sessionData));

  const link = `${BASE_URL}/clientreview.html/rate.html?client=${encodeURIComponent(clientKey)}`;
  document.getElementById("generatedLink").innerHTML = `<a href="${link}" target="_blank">${link}</a>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateLinkBtn");
  if (generateBtn) {
    generateBtn.addEventListener("click", generateLink);
  }
});
