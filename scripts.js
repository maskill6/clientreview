// Apps Script /exec URL
const API_BASE = 'https://script.google.com/macros/s/AKfycbzGUshQUlejXpdG5PxYv3RUbdQgj1aCLlHAE6e_LHdomaJ6i9slhZUE_ZBCQxvuRh4r/exec';
const repoRoot = 'https://maskill6.github.io/clientreview/';


const $job = document.getElementById('jobOrder');
const $client = document.getElementById('clientName');
const $email = document.getElementById('coordinatorEmail');
const $employees = document.getElementById('employeeList');
const $btn = document.getElementById('generateLinkBtn');
const $out = document.getElementById('generatedLink');

function cleanEmployees(text) {
  return text.split(/\n+/)
             .map(function(s) { return s.trim(); })
             .filter(function(x) { return x; });
}
function showMessage(html, isError){
  $out.innerHTML = html;
  $out.style.color = isError ? '#b00020' : '';
}
function validate(){
  if(!$job.value.trim()) return 'Please enter a Job Order #.';
  if(!$client.value.trim()) return 'Please enter a Client Name.';
  if(!$email.value.trim()) return 'Please enter the Coordinator Email.';
  if(cleanEmployees($employees.value).length === 0) return 'Please add at least one employee (one per line).';
  return '';
}

$btn.addEventListener('click', async function () {
  // 1) Validate
  const problem = validate();
  if (problem) { showMessage(problem, true); return; }

  // 2) Build payload
  const payload = {
    job_id: $job.value.trim(),
    client_name: $client.value.trim(),
    coordinator_email: $email.value.trim(),
    employees: cleanEmployees($employees.value)
  };

  // Remember names locally for rate.html
  try { localStorage.setItem('last_emps_' + payload.job_id, payload.employees.join('\n')); } catch (_) {}

  // 3) Build link FIRST, so we can show it even if API fails
  
  const ratingLink = repoRoot + 'rate.html?job=' + encodeURIComponent(payload.job_id);

  // 4) Try API init (form-encoded, no CORS drama)
  const body = new URLSearchParams();
  body.set('action', 'init');
  body.set('data', JSON.stringify(payload));

  $btn.disabled = true;
  showMessage('Generating link…');

  let apiError = '';
  try {
    if (!/^https?:\/\//.test(API_BASE)) throw new Error('API_BASE missing or invalid');
    const res = await fetch(API_BASE + '?t=' + Date.now(), {
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

  // 5) Show the link no matter what, plus any API error under it
  let html = `<strong>Share this link with the client:</strong><br>
            <a href="${ratingLink}" target="_blank" rel="noopener">${ratingLink}</a>`;

const adminLink = repoRoot + 'admin.html?job=' + encodeURIComponent(payload.job_id);
html += `<br><br><strong>Admin view (internal use only):</strong><br>
         <a href="${adminLink}" target="_blank" rel="noopener">${adminLink}</a>`;

  showMessage(html);
});
