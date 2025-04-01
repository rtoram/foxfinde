const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const nameFilter = document.getElementById('nameFilter');
const extFilter = document.getElementById('extFilter');
const dateFilter = document.getElementById('dateFilter');
const createFolderButton = document.getElementById('createFolder');
const toggleThemeButton = document.getElementById('toggleTheme');
const viewer = document.getElementById('viewer');
const imageView = document.getElementById('imageView');
const docView = document.getElementById('docView');
const closeViewer = document.getElementById('closeViewer');
const body = document.body;

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];
let theme = localStorage.getItem('theme') || 'dark';

applyTheme(theme);

uploadButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFiles(fileInput.files));
createFolderButton.addEventListener('click', createFolder);
closeViewer.addEventListener('click', closeFileViewer);
toggleThemeButton.addEventListener('click', toggleTheme);

nameFilter.addEventListener('input', filterFiles);
extFilter.addEventListener('input', filterFiles);
dateFilter.addEventListener('input', filterFiles);
window.addEventListener('load', filterFiles);

function handleFiles(files) {
    const path = currentPath.join('/');
    const currentDate = new Date().toISOString().split('T')[0];
    Array.from(files).forEach(file => {
        filesArray.push({
            name: file.name,
            size: file.size,
            type: file.name.split('.').pop().toLowerCase(),
            content: file,
            path: path,
            date: currentDate
        });
    });
    saveFiles();
    filterFiles();
}

function filterFiles() {
    const nameQuery = nameFilter.value.toLowerCase();
    const extQuery = extFilter.value.toLowerCase();
    const dateQuery = dateFilter.value;
    fileList.innerHTML = '';

    const currentFolder = currentPath.join('/');
    const filtered = filesArray.filter(file => 
        file.name.toLowerCase().includes(nameQuery) &&
        (extQuery === '' || file.type === extQuery.replace('.', '')) &&
        file.path === currentFolder &&
        (dateQuery === '' || file.date === dateQuery)
    );

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.classList.add(file.type === 'folder' ? 'folder' : 'file');
        li.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}`;

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

        const viewButton = document.createElement('button');
        viewButton.innerHTML = '🔍';
        viewButton.addEventListener('click', () => viewFile(file));

        buttonsDiv.appendChild(downloadButton);
        buttonsDiv.appendChild(deleteButton);
        buttonsDiv.appendChild(renameButton);
        buttonsDiv.appendChild(viewButton);
        li.appendChild(buttonsDiv);
        fileList.appendChild(li);

        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
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
            path: path,
            date: new Date().toISOString().split('T')[0]
        });
        saveFiles();
        filterFiles();
    }
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    filterFiles();
}

function viewFile(file) {
    const fileType = file.type.toLowerCase();
    viewer.style.display = 'block';

    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {
        imageView.src = URL.createObjectURL(file.content);
        imageView.style.display = 'block';
        imageView.style.maxWidth = '80%';
        imageView.style.maxHeight = '80%';
        docView.style.display = 'none';
    } else if (fileType === 'pdf' || fileType === 'txt' || fileType === 'doc' || fileType === 'docx') {
        docView.src = URL.createObjectURL(file.content);
        docView.style.display = 'block';
        docView.style.maxWidth = '80%';
        docView.style.maxHeight = '80%';
        imageView.style.display = 'none';
    }
}

function closeFileViewer() {
    viewer.style.display = 'none';
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
}
