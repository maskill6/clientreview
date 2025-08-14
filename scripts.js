// Replace with your actual Apps Script web app URL
const BASE_URL = 'https://script.google.com/macros/s/AKfycbzGUshQUlejXpdG5PxYv3RUbdQgj1aCLlHAE6e_LHdomaJ6i9slhZUE_ZBCQxvuRh4r/exec';

const $job = document.getElementById('jobOrder');
const $client = document.getElementById('clientName');
const $email = document.getElementById('coordinatorEmail');
const $employees = document.getElementById('employeeList');
const $btn = document.getElementById('generateLinkBtn');
const $out = document.getElementById('generatedLink');

function cleanEmployees(text) {
  return text.split(/\n+/).map(s => s.trim()).filter(Boolean);
}

function showMessage(html, isError) {
  $out.innerHTML = html;
  $out.style.color = isError ? '#b00020' : '';
}

function validate() {
  if (!$job.value.trim()) return 'Please enter a Job Order #.';
  if (!$client.value.trim()) return 'Please enter a Client Name.';
  if (!$email.value.trim()) return 'Please enter the Coordinator Email.';
  if (cleanEmployees($employees.value).length === 0) return 'Please add at least one employee (one per line).';
  return '';
}

$btn.addEventListener('click', async function () {
  const problem = validate();
  if (problem) {
    showMessage(problem, true);
    return;
  }

  const payload = {
    job_id: $job.value.trim(),
    client_name: $client.value.trim(),
    coordinator_email: $email.value.trim(),
    employees: cleanEmployees($employees.value)
  };

  try {
    localStorage.setItem('last_emps_' + payload.job_id, payload.employees.join('\n'));
  } catch (_) {}

  const ratingLink = `${BASE_URL}?job=${encodeURIComponent(payload.job_id)}`;
  const adminLink = `${BASE_URL}?job=${encodeURIComponent(payload.job_id)}&token=b7f3c9d8f6e47e2a9c4c1ee3dd28b5&action=admin`;

  const body = new URLSearchParams();
  body.set('action', 'init');
  body.set('data', JSON.stringify(payload));

  $btn.disabled = true;
  showMessage('Generating link…');

  let apiError = '';
  try {
    const res = await fetch(BASE_URL + '?t=' + Date.now(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });
    const data = await res.json();
    if (!data || !data.ok) {
      apiError = (data && data.error) ? data.error : 'Init failed (no ok flag)';
    }
  } catch (e) {
    apiError = e.message || String(e);
  } finally {
    $btn.disabled = false;
  }

  let html = `<strong>Client rating link:</strong><br>
              <a href="${ratingLink}" target="_blank">${ratingLink}</a><br><br>
              <strong>Admin view:</strong><br>
              <a href="${adminLink}" target="_blank">${adminLink}</a>`;

  if (apiError) {
    html += `<div style="color:#b00020;margin-top:1rem;">⚠️ API error: ${apiError}</div>`;
    console.warn('API init failed:', apiError, payload);
  }

  showMessage(html);
});
