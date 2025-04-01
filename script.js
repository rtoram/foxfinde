const elements = {
    uploadButton: document.getElementById('uploadButton'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    folderList: document.getElementById('folderList'),
    nameFilter: document.getElementById('nameFilter'),
    extFilter: document.getElementById('extFilter'),
    dateFilter: document.getElementById('dateFilter'),
    createFolderButton: document.getElementById('createFolder'),
    toggleThemeButton: document.getElementById('toggleTheme'),
    viewer: document.getElementById('viewer'),
    imageView: document.getElementById('imageView'),
    docView: document.getElementById('docView'),
    closeViewer: document.getElementById('closeViewer'),
    currentPathSpan: document.getElementById('currentPath'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalInput: document.getElementById('modalInput'),
    modalConfirm: document.getElementById('modalConfirm'),
    modalCancel: document.getElementById('modalCancel'),
    modalClose: document.getElementById('modalClose')
};

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];
let theme = localStorage.getItem('theme') || 'dark';
let currentFileToRename = null;

document.body.className = `theme-${theme}`;
addEventListeners();
filterFiles();

function addEventListeners() {
    elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
        }
    });
    elements.createFolderButton.addEventListener('click', showCreateFolderModal);
    elements.toggleThemeButton.addEventListener('click', toggleTheme);
    elements.closeViewer.addEventListener('click', closeFileViewer);
    elements.nameFilter.addEventListener('input', filterFiles);
    elements.extFilter.addEventListener('input', filterFiles);
    elements.dateFilter.addEventListener('input', filterFiles);
    
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);

    elements.folderList.addEventListener('dragover', (e) => e.preventDefault());
    elements.folderList.addEventListener('drop', handleDrop);
}

function handleFiles(files) {
    const path = currentPath.join('/');
    const currentDate = new Date().toISOString().split('T')[0];
    let filesProcessed = 0;

    Array.from(files).forEach(file => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            filesArray.push({
                name: file.name,
                size: file.size,
                type: file.name.split('.').pop().toLowerCase(),
                content: e.target.result,
                path: path,
                date: currentDate
            });
            filesProcessed++;
            if (filesProcessed === files.length) {
                saveFiles();
                filterFiles();
            }
        };
        fileReader.onerror = () => {
            console.error(`Erro ao ler o arquivo: ${file.name}`);
            filesProcessed++;
            if (filesProcessed === files.length) {
                saveFiles();
                filterFiles();
            }
        };
        fileReader.readAsDataURL(file);
    });
}

function filterFiles() {
    const nameQuery = elements.nameFilter.value.toLowerCase();
    const extQuery = elements.extFilter.value.toLowerCase().replace('.', '');
    const dateQuery = elements.dateFilter.value;
    elements.fileList.innerHTML = '';
    elements.folderList.innerHTML = '';
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
        li.draggable = true;
        li.dataset.name = file.name;
        li.dataset.path = file.path;
        li.className = file.type === 'folder' ? 'folder' : 'file';
        li.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}</span>
            <div class="buttons">
                <button class="download-btn" data-name="${file.name}" data-path="${file.path}"><i class="fas fa-download"></i></button>
                <button class="delete-btn" data-name="${file.name}" data-path="${file.path}"><i class="fas fa-trash"></i></button>
                <button class="rename-btn" data-name="${file.name}" data-path="${file.path}"><i class="fas fa-edit"></i></button>
                <button class="view-btn" data-name="${file.name}" data-path="${file.path}"><i class="fas fa-eye"></i></button>
            </div>
        `;
        
        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
            elements.folderList.appendChild(li);
        } else {
            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', file.name);
                e.dataTransfer.setData('path', file.path);
            });
            elements.fileList.appendChild(li);
        }

        li.querySelector('.download-btn').addEventListener('click', () => downloadFile(file.name, file.path));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteFile(file.name, file.path));
        li.querySelector('.rename-btn').addEventListener('click', () => showRenameModal(file.name, file.path));
        li.querySelector('.view-btn').addEventListener('click', () => viewFile(file.name, file.path));
    });
}

function saveFiles() {
    localStorage.setItem('filesArray', JSON.stringify(filesArray));
}

function downloadFile(fileName, path) {
    const file = filesArray.find(f => f.name === fileName && f.path === path);
    if (!file || !file.content) return;
    const a = document.createElement('a');
    a.href = file.content;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function deleteFile(fileName, path) {
    filesArray = filesArray.filter(f => !(f.name === fileName && f.path === path));
    saveFiles();
    filterFiles();
}

function showRenameModal(fileName, path) {
    currentFileToRename = filesArray.find(f => f.name === fileName && f.path === path);
    if (!currentFileToRename) return;
    elements.modalTitle.textContent = 'Renomear Arquivo';
    elements.modalInput.value = currentFileToRename.name;
    elements.modal.style.display = 'block';
}

function showCreateFolderModal() {
    currentFileToRename = null;
    elements.modalTitle.textContent = 'Nova Pasta';
    elements.modalInput.value = '';
    elements.modal.style.display = 'block';
}

function handleModalConfirm() {
    const newName = elements.modalInput.value.trim();
    if (!newName) return;

    if (currentFileToRename) {
        currentFileToRename.name = newName;
    } else {
        const path = currentPath.join('/');
        filesArray.push({
            name: newName,
            type: 'folder',
            path: path,
            date: new Date().toISOString().split('T')[0],
            size: 0
        });
    }
    
    saveFiles();
    filterFiles();
    closeModal();
}

function closeModal() {
    elements.modal.style.display = 'none';
    elements.modalInput.value = '';
    currentFileToRename = null;
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    filterFiles();
}

function navigateToRoot() {
    currentPath = [];
    filterFiles();
}

function viewFile(fileName, path) {
    const file = filesArray.find(f => f.name === fileName && f.path === path);
    if (!file || !file.content) return;
    
    elements.viewer.style.display = 'flex';
    const fileType = file.type.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
        elements.imageView.src = file.content;
        elements.imageView.style.display = 'block';
        elements.docView.style.display = 'none';
    } else if (['pdf', 'txt', 'doc', 'docx'].includes(fileType)) {
        elements.docView.src = file.content;
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

function handleDrop(e) {
    e.preventDefault();
    const fileName = e.dataTransfer.getData('text/plain');
    const oldPath = e.dataTransfer.getData('path');
    const folderName = e.target.closest('.folder')?.dataset.name;
    
    if (folderName) {
        const file = filesArray.find(f => f.name === fileName && f.path === oldPath);
        if (file && file.type !== 'folder') {
            file.path = `${currentPath.join('/')}/${folderName}`.replace('//', '/');
            saveFiles();
            filterFiles();
        }
    }
}
