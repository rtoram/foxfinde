const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const nameFilter = document.getElementById('nameFilter');
const extFilter = document.getElementById('extFilter');

let filesArray = [];

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
    filesArray = Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.name.split('.').pop().toLowerCase()
    }));
    filterFiles();
}

function filterFiles() {
    const nameQuery = nameFilter.value.toLowerCase();
    const extQuery = extFilter.value.toLowerCase();
    fileList.innerHTML = '';

    const filtered = filesArray.filter(file => 
        file.name.toLowerCase().includes(nameQuery) &&
        (extQuery === '' || file.type === extQuery.replace('.', ''))
    );

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileList.appendChild(li);
    });
}

nameFilter.addEventListener('input', filterFiles);
extFilter.addEventListener('input', filterFiles);
