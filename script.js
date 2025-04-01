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
                <button class="download-btn" data-name="${file.name}"><i class="fas fa-download"></i></button>
                <button class="delete-btn" data-name="${file.name}"><i class="fas fa-trash"></i></button>
                <button class="rename-btn" data-name="${file.name}"><i class="fas fa-edit"></i></button>
                <button class="view-btn" data-name="${file.name}"><i class="fas fa-eye"></i></button>
            </div>
        `;
        if (file.type === 'folder') {
            li.addEventListener('dblclick', () => navigateToFolder(file));
        }
        elements.fileList.appendChild(li);
    });

    // Adicionar eventos após criar os botões
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => downloadFile(btn.dataset.name));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteFile(btn.dataset.name));
    });
    document.querySelectorAll('.rename-btn').forEach(btn => {
        btn.addEventListener('click', () => showRenameModal(btn.dataset.name));
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewFile(btn.dataset.name));
    });
}

function saveFiles() {
    localStorage.setItem('filesArray', JSON.stringify(filesArray.map(file => ({
        ...file,
        content: file.content instanceof File ? undefined : file.content // Não salvar o blob diretamente
    })));
}

function downloadFile(fileName) {
    const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
    if (!file || !file.content) return;
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

function showRenameModal(fileName) {
    currentFileToRename = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
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
        // Renomear arquivo
        currentFileToRename.name = newName;
    } else {
        // Criar nova pasta
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

function viewFile(fileName) {
    const file = filesArray.find(f => f.name === fileName && f.path === currentPath.join('/'));
    if (!file || (!file.content && file.type !== 'folder')) return;
    
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
    elements.imageView.src = ''; // Limpar a imagem para evitar memory leak
    elements.docView.src = '';
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
