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
    elements.fileInput.addEventListener('change', () => handleFiles(elements.fileInput.files));
    elements.createFolderButton.addEventListener('click', showCreateFolderModal);
    elements.closeViewer.addEventListener('click', closeFileViewer);
    elements.toggleThemeButton.addEventListener('click', toggleTheme);
    elements.nameFilter.addEventListener('input', filterFiles);
    elements.extFilter.addEventListener('input', filterFiles);
    elements.dateFilter.addEventListener('input', filterFiles);
    
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);

    // Drag and Drop
    elements.folderList.addEventListener('dragover', (e) => e.preventDefault());
    elements.folderList.addEventListener('drop', handleDrop);
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
        li.className = file.type === 'folder' ? 'folder' : 'file';
        li.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}</span>
            <div class="buttons">
                <button onclick="downloadFile('${file.name}')"><i class="fas fa-download"></i></button>
                <button onclick="deleteFile('${file.name}')"><i class="fas fa-trash"></i></button>
                <button onclick="showRenameModal('${file.name}')"><i class="fas fa-edit"></i></button>
                <button onclick="viewFile('${file.name}')"><i class="fas fa-eye"></i></button>
            </div>
        `;
        
        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
            elements.folderList.appendChild(li);
        } else {
            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', file.name);
            });
            elements.fileList.appendChild(li);
        }
    });
}

function handleDrop(e) {
    e.preventDefault();
    const fileName = e.dataTransfer.getData('text/plain');
    const folderName = e.target.closest('.folder')?.dataset.name;
    
    if (folderName) {
        const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
        if (file && file.type !== 'folder') {
            file.path = `${currentPath.join('/')}/${folderName}`.replace('//', '/');
            saveFiles();
            filterFiles();
        }
    }
}

// ... (manter as outras funções como estão: saveFiles, downloadFile, etc.) ...
