const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('file');
const dropzone = document.getElementById('dropzone');
const fileInfo = document.getElementById('fileInfo');
const errorBox = document.getElementById('error');
const resultContainer = document.getElementById('resultContainer');
const resultElement = document.getElementById('result');
const resultSummary = document.getElementById('resultSummary');
const uploadBtn = document.getElementById('uploadBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const apiStatus = document.getElementById('apiStatus');

let outputText = '';
let outputFormat = 'json';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** exponent)).toFixed(exponent ? 1 : 0)} ${units[exponent]}`;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function updateFileInfo() {
  const file = fileInput.files[0];
  fileInfo.textContent = file
    ? `${file.name} · ${formatBytes(file.size)}`
    : 'XLSX · XLS · CSV · TXT · PDF';
}

fileInput.addEventListener('change', updateFileInfo);

for (const eventName of ['dragenter', 'dragover']) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
}

for (const eventName of ['dragleave', 'drop']) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  });
}

dropzone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (!file) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  updateFileInfo();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  resultContainer.classList.add('hidden');

  const file = fileInput.files[0];
  if (!file) {
    showError('Choose a file first.');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Converting…';

  const format = document.getElementById('format').value;
  const chunkSize = document.getElementById('chunkSize').value;
  const overlap = document.getElementById('overlap').value;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const params = new URLSearchParams({ format, chunkSize, overlap });
    const response = await fetch(`/api/files/upload?${params.toString()}`, {
      method: 'POST',
      body: formData
    });

    const body = await response.text();
    if (!response.ok) {
      let message = body;
      try {
        message = JSON.parse(body).error || body;
      } catch (_) {
        // Keep plain-text response.
      }
      throw new Error(message || 'Conversion failed');
    }

    outputFormat = format;
    outputText = format === 'json'
      ? JSON.stringify(JSON.parse(body), null, 2)
      : body.trimEnd();

    const count = response.headers.get('X-Document-Count');
    resultElement.textContent = outputText;
    resultSummary.textContent = `${count || '0'} document chunks · ${format.toUpperCase()}`;
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Convert file';
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  clearError();
  resultContainer.classList.add('hidden');
  fileInfo.textContent = 'XLSX · XLS · CSV · TXT · PDF';
  outputText = '';
});

copyBtn.addEventListener('click', async () => {
  if (!outputText) return;
  await navigator.clipboard.writeText(outputText);
  const original = copyBtn.textContent;
  copyBtn.textContent = 'Copied';
  setTimeout(() => { copyBtn.textContent = original; }, 1200);
});

downloadBtn.addEventListener('click', () => {
  if (!outputText) return;
  const type = outputFormat === 'jsonl' ? 'application/x-ndjson' : 'application/json';
  const blob = new Blob([`${outputText}\n`], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `converted-data.${outputFormat}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

fetch('/health')
  .then((response) => {
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  })
  .then((health) => {
    apiStatus.textContent = `API online · v${health.version}`;
    apiStatus.classList.add('ok');
  })
  .catch(() => {
    apiStatus.textContent = 'API unavailable';
    apiStatus.classList.add('bad');
  });
