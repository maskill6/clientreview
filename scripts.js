// Apps Script /exec URL
const API_BASE = 'https://script.google.com/macros/s/PASTE_YOUR_EXEC_URL_HERE/exec'; // <-- replace

const $job = document.getElementById('jobOrder');
const $client = document.getElementById('clientName');
const $email = document.getElementById('coordinatorEmail');
const $employees = document.getElementById('employeeList');
const $btn = document.getElementById('generateLinkBtn');
const $out = document.getElementById('generatedLink');

function cleanEmployees(text){
  return text.split(/
+/).map(function(s){return s.trim();}).filter(function(x){return x;});
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

$btn.addEventListener('click', async function(){
  const problem = validate();
  if (problem){ showMessage(problem, true); return; }

  const payload = {
    job_id: $job.value.trim(),
    client_name: $client.value.trim(),
    coordinator_email: $email.value.trim(),
    employees: cleanEmployees($employees.value)
  };

  try { localStorage.setItem('last_emps_'+payload.job_id, payload.employees.join('
')); } catch(_){ }

  const body = new URLSearchParams();
  body.set('action','init');
  body.set('data', JSON.stringify(payload));

  $btn.disabled = true; showMessage('Generating link…');
  try {
    const res = await fetch(API_BASE + '?t=' + Date.now(), { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: body.toString() });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Init failed');

    // 🔒 Hard-coded repo root to avoid double filenames / path issues
    const repoRoot = 'https://maskill6.github.io/clientreview/';
    const ratingLink = repoRoot + 'rate.html?job=' + encodeURIComponent(payload.job_id);

    showMessage('<strong>Share this link with the client:</strong><br><a href="'+ratingLink+'" target="_blank" rel="noopener">'+ratingLink+'</a>');
  } catch (e) {
    showMessage('Error: ' + (e.message || String(e)), true);
  } finally {
    showMessage('Error: ' + (e.message || String(e)), true);
  } finally {
    $btn.disabled = false;
  }
});
