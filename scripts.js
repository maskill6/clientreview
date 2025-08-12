// ====== CONFIG ======
// 1) Put your Apps Script /exec URL here:
const API_BASE = 'https://script.google.com/macros/s/AKfycbzGUshQUlejXpdG5PxYv3RUbdQgj1aCLlHAE6e_LHdomaJ6i9slhZUE_ZBCQxvuRh4r/exec';

// ====== DOM HOOKS ======
const $job      = document.getElementById('jobOrder');
const $client   = document.getElementById('clientName');
const $email    = document.getElementById('coordinatorEmail');
const $employees= document.getElementById('employeeList');
const $btn      = document.getElementById('generateLinkBtn');
const $out      = document.getElementById('generatedLink');

// ====== UTIL ======
function cleanEmployees(text) {
  return text
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function showMessage(html, isError = false) {
  $out.innerHTML = html;
  $out.style.color = isError ? '#b00020' : '';
}

function validate() {
  if (!$job.value.trim()) return 'Please enter a Job Order #.';
  if (!$client.value.trim()) return 'Please enter a Client Name.';
  if (!$email.value.trim()) return 'Please enter the Coordinator Email.';
  const list = cleanEmployees($employees.value);
  if (list.length === 0) return 'Please add at least one employee (one per line).';
  return '';
}

// ====== MAIN ======
$btn.addEventListener('click', async () => {
  // 1) Basic validation (keep it friendly)
  const problem = validate();
  if (problem) {
    showMessage(problem, true);
    return;
  }

  // 2) Build the payload the Apps Script expects
  const payload = {
    job_id: $job.value.trim(),
    client_name: $client.value.trim(),
    coordinator_email: $email.value.trim(),
    employees: cleanEmployees($employees.value)
  };

  // Optional: remember last employee list per job in localStorage (handy for rate page)
  try {
    localStorage.setItem('last_emps_' + payload.job_id, payload.employees.join('\n'));
  } catch (_) {}

  // 3) Form-encoded POST (avoids preflight/CORS headaches on GitHub Pages)
  const form = new URLSearchParams();
  form.set('action', 'init');
  form.set('data', JSON.stringify(payload));

  // 4) Disable button during request
  $btn.disabled = true;
  showMessage('Generating link…');

  try {
    const res = await fetch(API_BASE + '?t=' + Date.now(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString()
    });

    // Apps Script always returns 200; read the JSON body for status
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || 'Init failed');
    }

    // 5) Build the rating page link
    //    This expects you to have a rate.html in the same repo.
    const basePath = location.origin + location.pathname.replace(/index\.html?$/i, '');
    const ratingLink = `${basePath}rate.html?job=${encodeURIComponent(payload.job_id)}`;

    showMessage(
      `<strong>Share this link with the client:</strong><br>
       <a href="${ratingLink}" target="_blank" rel="noopener">${ratingLink}</a>`
    );
  } catch (err) {
    showMessage('Error: ' + (err.message || String(err)), true);
  } finally {
    $btn.disabled = false;
  }
});
