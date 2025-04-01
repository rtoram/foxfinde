const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const nameFilter = document.getElementById('nameFilter');
const extFilter = document.getElementById('extFilter');
const createFolderButton = document.getElementById('createFolder');

let filesArray = [];
let currentPath = [];

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
createFolderButton.addEventListener('click', createFolder);

function handleFiles(files) {
    const path = currentPath.join('/');
    Array.from(files).forEach(file => {
        filesArray.push({
            name: file.name,
            size: file.size,
            type: file.name.split('.').pop().toLowerCase(),
            content: file,
            path: path
        });
    });
    filterFiles();
}

function filterFiles() {
    const nameQuery = nameFilter.value.toLowerCase();
    const extQuery = extFilter.value.toLowerCase();
    fileList.innerHTML = '';

    const currentFolder = currentPath.join('/');
    const filtered = filesArray.filter(file => 
        file.name.toLowerCase().includes(nameQuery) &&
        (extQuery === '' || file.type === extQuery.replace('.', '')) &&
        file.path === currentFolder
    );

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.addEventListener('click', () => downloadFile(file));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.addEventListener('click', () => deleteFile(file));

        li.appendChild(downloadButton);
        li.appendChild(deleteButton);
        fileList.appendChild(li);
    });

    // Adicionar pastas
    const folders = filesArray
        .filter(file => file.type === 'folder' && file.path === currentFolder)
        .map(file => file.name);
    
    folders.forEach(folder => {
        const li = document.createElement('li');
        li.textContent = folder;
        li.classList.add('folder');
        li.addEventListener('click', () => navigateToFolder(folder));
        fileList.appendChild(li);
    });
}

function downloadFile(file) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file.content);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function deleteFile(file) {
    filesArray = filesArray.filter(f => f !== file);
    filterFiles();
}

function createFolder() {
    const folderName = prompt('Nome da nova pasta:');
    if (folderName) {
        const path = currentPath.join('/');
        filesArray.push({
            name: folderName,
            type: 'folder',
            path: path
        });
        filterFiles();
    }
}

function navigateToFolder(folder) {
    currentPath.push(folder);
    filterFiles();
}

nameFilter.addEventListener('input', filterFiles);
extFilter.addEventListener('input', filterFiles);
