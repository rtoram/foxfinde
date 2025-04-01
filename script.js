const elements = {
    uploadButton: document.getElementById('uploadButton'),
    fileInput: document.getElementById('fileInput'),
    fileList: document.getElementById('fileList'),
    folderList: document.getElementById('folderList'),
    createFolderButton: document.getElementById('createFolder'),
    toggleThemeButton: document.getElementById('toggleTheme'),
    currentPathSpan: document.getElementById('currentPath'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalInput: document.getElementById('modalInput'),
    modalConfirm: document.getElementById('modalConfirm'),
    modalCancel: document.getElementById('modalCancel'),
    modalClose: document.getElementById('modalClose'),
    helpButton: document.getElementById('helpButton'),
    helpModal: document.getElementById('helpModal'),
    helpModalClose: document.getElementById('helpModalClose'),
    confirmModal: document.getElementById('confirmModal'),
    confirmModalTitle: document.getElementById('confirmModalTitle'),
    confirmModalMessage: document.getElementById('confirmModalMessage'),
    confirmModalYes: document.getElementById('confirmModalYes'),
    confirmModalNo: document.getElementById('confirmModalNo'),
    confirmModalClose: document.getElementById('confirmModalClose'),
    viewer: document.getElementById('viewer'),
    imageView: document.getElementById('imageView'),
    docView: document.getElementById('docView'),
    closeViewer: document.getElementById('closeViewer'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect')
};

let filesArray = JSON.parse(localStorage.getItem('filesArray')) || [];
let currentPath = [];
let theme = localStorage.getItem('theme') || 'dark';
let currentFileToRename = null;
let fileToDelete = null;

document.body.className = `theme-${theme}`;
addEventListeners();
renderFiles();

function addEventListeners() {
    elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.createFolderButton.addEventListener('click', showCreateFolderModal);
    elements.toggleThemeButton.addEventListener('click', toggleTheme);
    elements.modalClose.addEventListener('click', closeModal);
    elements.modalCancel.addEventListener('click', closeModal);
    elements.modalConfirm.addEventListener('click', handleModalConfirm);
    elements.helpButton.addEventListener('click', showHelpModal);
    elements.helpModalClose.addEventListener('click', closeHelpModal);
    elements.confirmModalYes.addEventListener('click', confirmDelete);
    elements.confirmModalNo.addEventListener('click', closeConfirmModal);
    elements.confirmModalClose.addEventListener('click', closeConfirmModal);
    elements.closeViewer.addEventListener('click', closeViewer);
    elements.folderList.addEventListener('dragover', (e) => e.preventDefault());
    elements.folderList.addEventListener('drop', handleDrop);
    elements.searchInput.addEventListener('input', renderFiles);
    elements.sortSelect.addEventListener('change', renderFiles);
}

function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const path = currentPath.join('/'); // Arquivos vão para a pasta atual
    const currentDate = new Date().toISOString().split('T')[0];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            filesArray.push({
                name: file.name,
                size: file.size,
                type: file.name.split('.').pop().toLowerCase(),
                content: event.target.result,
                path: path,
                date: currentDate
            });
            saveFiles();
            renderFiles();
        };
        reader.readAsDataURL(file);
    });
    e.target.value = '';
}

function renderFiles() {
    elements.fileList.innerHTML = '';
    elements.folderList.innerHTML = '';
    updatePathDisplay();

    const currentFolder = currentPath.join('/');
    let filtered = filesArray.filter(file => file.path === currentFolder);

    // Busca por nome
    const searchQuery = elements.searchInput.value.toLowerCase();
    filtered = filtered.filter(file => file.name.toLowerCase().includes(searchQuery));

    // Ordenação
    const sortOption = elements.sortSelect.value;
    filtered.sort((a, b) => {
        if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
        if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
        if (sortOption === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortOption === 'date-desc') return new Date(b.date) - new Date(a.date);
        return 0;
    });

    filtered.forEach(file => {
        const li = document.createElement('li');
        li.draggable = file.type !== 'folder';
        li.dataset.name = file.name;
        li.dataset.path = file.path;
        li.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB) - ${file.date}</span>
            <div class="buttons">
                <button class="download-btn" title="Baixar arquivo"><i class="fas fa-download"></i></button>
                <button class="delete-btn" title="Excluir arquivo ou pasta"><i class="fas fa-trash"></i></button>
                <button class="rename-btn" title="Renomear arquivo ou pasta"><i class="fas fa-edit"></i></button>
                <button class="view-btn" title="Visualizar arquivo"><i class="fas fa-eye"></i></button>
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
        li.querySelector('.delete-btn').addEventListener('click', () => showConfirmDelete(file.name, file.path));
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

function showConfirmDelete(fileName, path) {
    fileToDelete = { name: fileName, path: path };
    const file = filesArray.find(f => f.name === fileName && f.path === path);
    const isFolder = file.type === 'folder';
    const hasFiles = isFolder && filesArray.some(f => f.path.startsWith(`${path}/${fileName}`));
    
    elements.confirmModalTitle.textContent = `Deletar ${isFolder ? 'Pasta' : 'Arquivo'}`;
    elements.confirmModalMessage.textContent = hasFiles 
        ? `A pasta "${fileName}" contém arquivos. Deseja realmente deletá-la e todo seu conteúdo?`
        : `Deseja realmente deletar "${fileName}"?`;
    elements.confirmModal.style.display = 'block';
}

function confirmDelete() {
    if (!fileToDelete) return;
    const { name, path } = fileToDelete;
    const fullPath = path ? `${path}/${name}` : name;
    
    filesArray = filesArray.filter(f => f.path !== fullPath && !f.path.startsWith(`${fullPath}/`) && !(f.name === name && f.path === path));
    saveFiles();
    renderFiles();
    closeConfirmModal();
}

function closeConfirmModal() {
    elements.confirmModal.style.display = 'none';
    fileToDelete = null;
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
        const newFolder = {
            name: newName,
            type: 'folder',
            path: path,
            date: new Date().toISOString().split('T')[0],
            size: 0
        };
        filesArray.push(newFolder);
        saveFiles();
        navigateToFolder(newFolder); // Abre a pasta imediatamente
    }
    saveFiles();
    renderFiles();
    closeModal();
}

function closeModal() {
    elements.modal.style.display = 'none';
    elements.modalInput.value = '';
    currentFileToRename = null;
}

function navigateToFolder(folder) {
    currentPath.push(folder.name);
    renderFiles();
}

function navigateToRoot() {
    currentPath = [];
    renderFiles();
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

function closeViewer() {
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
        `<span onclick="navigateToPath('${p}')" title="Ir para ${p}">${p}</span>`
    ).join(' / ');
}

function navigateToPath(folderName) {
    const index = currentPath.indexOf(folderName);
    if (index !== -1) {
        currentPath = currentPath.slice(0, index + 1);
        renderFiles();
    }
}

function showHelpModal() {
    elements.helpModal.style.display = 'block';
}

function closeHelpModal() {
    elements.helpModal.style.display = 'none';
}

function handleDrop(e) {
    e.preventDefault();
    const fileName = e.dataTransfer.getData('text/plain');
    const oldPath = e.dataTransfer.getData('path');
    const folderName = e.target.closest('li.folder')?.dataset.name;

    if (folderName) {
        const file = filesArray.find(f => f.name === fileName && f.path === oldPath);
        if (file && file.type !== 'folder') {
            file.path = `${currentPath.join('/')}/${folderName}`.replace('//', '/');
            saveFiles();
            renderFiles();
        }
    }
}
