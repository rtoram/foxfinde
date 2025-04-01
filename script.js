const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const nameFilter = document.getElementById('nameFilter');
const extFilter = document.getElementById('extFilter');
const createFolderButton = document.getElementById('createFolder');

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];

uploadButton.addEventListener('click', () => fileInput.click());
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
    saveFiles();
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
        li.classList.add(file.type === 'folder' ? 'folder' : 'file');
        li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        const downloadButton = document.createElement('button');
        downloadButton.innerHTML = 'D';
        downloadButton.addEventListener('click', () => downloadFile(file));

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '❌';
        deleteButton.addEventListener('click', () => deleteFile(file));

        const renameButton = document.createElement('button');
        renameButton.innerHTML = '✏️';
        renameButton.addEventListener('click', () => renameFile(file));

        buttonsDiv.appendChild(downloadButton);
        buttonsDiv.appendChild(deleteButton);
        buttonsDiv.appendChild(renameButton);
        li.appendChild(buttonsDiv);
        fileList.appendChild(li);

        if (file.type === 'folder') {
            li.addEventListener('click', () => navigateToFolder(file));
        }
    });
}

function saveFiles() {
    localStorage.setItem('filesArray', JSON.stringify(filesArray));
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
    saveFiles();
    filterFiles();
}

function renameFile(file) {
    const newName = prompt('Novo nome:', file.name);
    if (newName) {
        file.name = newName;
        saveFiles();
        filterFiles();
    }
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
        saveFiles();
        filterFiles();
    }
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    filterFiles();
}

nameFilter.addEventListener('input', filterFiles);
extFilter.addEventListener('input', filterFiles);
window.addEventListener('load', filterFiles);
