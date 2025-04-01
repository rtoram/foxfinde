const elements = {
    uploadButton: document.getElementById('uploadButton'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    nameFilter: document.getElementById('nameFilter'),
    extFilter: document.getElementById('extFilter'),
    dateFilter: document.getElementById('dateFilter'),
    createFolderButton: document.getElementById('createFolder'),
    toggleThemeButton: document.getElementById('toggleTheme'),
    viewer: document.getElementById('viewer'),
    imageView: document.getElementById('imageView'),
    docView: document.getElementById('docView'),
    closeViewer: document.getElementById('closeViewer'),
    currentPathSpan: document.getElementById('currentPath')
};

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];
let theme = localStorage.getItem('theme') || 'dark';

document.body.className = `theme-${theme}`;
addEventListeners();
filterFiles();

function addEventListeners() {
    elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', () => handleFiles(elements.fileInput.files));
    elements.createFolderButton.addEventListener('click', createFolder);
    elements.closeViewer.addEventListener('click', closeFileViewer);
    elements.toggleThemeButton.addEventListener('click', toggleTheme);
    elements.nameFilter.addEventListener('input', filterFiles);
    elements.extFilter.addEventListener('input', filterFiles);
    elements.dateFilter.addEventListener('input', filterFiles);
}

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
    const nameQuery = elements.nameFilter.value.toLowerCase();
    const extQuery = elements.extFilter.value.toLowerCase().replace('.', '');
    const dateQuery = elements.dateFilter.value;
    elements.fileList.innerHTML = '';
    updatePathDisplay();

    const currentFolder = currentPath.join('/');
    const filtered = filesArray.filter(file => 
        file.name.toLowerCase().includes(nameQuery) &&
        (extQuery === '' || file.type === extQuery) &&
        file.path === currentFolder &&
        (dateQuery === '' || file.date === dateQuery)
    );

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.className = file.type === 'folder' ? 'folder' : 'file';
        li.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}</span>
            <div class="buttons">
                <button onclick="downloadFile('${file.name}')"><i class="fas fa-download"></i></button>
                <button onclick="deleteFile('${file.name}')"><i class="fas fa-trash"></i></button>
                <button onclick="renameFile('${file.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="viewFile('${file.name}')"><i class="fas fa-eye"></i></button>
            </div>
        `;
        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
        }
        elements.fileList.appendChild(li);
    });
}

function saveFiles() {
    localStorage.setItem('filesArray', JSON.stringify(filesArray));
}

function downloadFile(fileName) {
    const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
    if (!file.content) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file.content);
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function deleteFile(fileName) {
    filesArray = filesArray.filter(f => !(f.name === fileName && f.path === currentPath.join('/')));
    saveFiles();
    filterFiles();
}

function renameFile(fileName) {
    const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
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
            date: new Date().toISOString().split('T')[0],
            size: 0
        });
        saveFiles();
        filterFiles();
    }
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    filterFiles();
}

function navigateToRoot() {
    currentPath = [];
    filterFiles();
}

function viewFile(fileName) {
    const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
    if (!file.content) return;
    
    elements.viewer.style.display = 'flex';
    const fileType = file.type.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        elements.imageView.src = URL.createObjectURL(file.content);
        elements.imageView.style.display = 'block';
        elements.docView.style.display = 'none';
    } else if (['pdf', 'txt', 'doc', 'docx'].includes(fileType)) {
        elements.docView.src = URL.createObjectURL(file.content);
        elements.docView.style.display = 'block';
        elements.imageView.style.display = 'none';
    }
}

function closeFileViewer() {
    elements.viewer.style.display = 'none';
    elements.imageView.style.display = 'none';
    elements.docView.style.display = 'none';
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
}

function updatePathDisplay() {
    elements.currentPathSpan.innerHTML = currentPath.map(p => 
        `<span>${p}</span>`
    ).join(' / ');
}
