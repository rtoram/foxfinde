<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Arquivos</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="menu" class="futuristic-menu">
        <h1><i class="fas fa-folder-open"></i> Arquivos</h1>
        <button id="uploadButton" class="futuristic-btn"><i class="fas fa-upload"></i> Upload</button>
        <input type="file" id="fileInput" multiple style="display: none;">
        <button id="createFolder" class="futuristic-btn"><i class="fas fa-folder-plus"></i> Nova Pasta</button>
        <div class="filter-container">
            <input type="text" id="nameFilter" class="futuristic-input" placeholder="Filtrar por nome">
            <input type="text" id="extFilter" class="futuristic-input" placeholder="Filtrar por extensão (ex: .pdf)">
            <input type="date" id="dateFilter" class="futuristic-input">
        </div>
        <button id="toggleTheme" class="futuristic-btn"><i class="fas fa-adjust"></i> Tema</button>
    </div>

    <div id="main-content" class="futuristic-container">
        <div id="fileListContainer">
            <div class="path-breadcrumbs futuristic-breadcrumbs">
                <span onclick="navigateToRoot()">Raiz</span>
                <span id="currentPath"></span>
            </div>
            <div class="content-wrapper">
                <ul id="fileList" class="file-grid"></ul>
                <ul id="folderList" class="folder-grid"></ul>
            </div>
        </div>
        
        <div id="viewer" class="futuristic-viewer">
            <button id="closeViewer" class="futuristic-btn"><i class="fas fa-times"></i></button>
            <img id="imageView" style="display: none;">
            <iframe id="docView" style="display: none;"></iframe>
        </div>
    </div>

    <div id="modal" class="futuristic-modal">
        <div class="modal-content">
            <span id="modalClose" class="modal-close">×</span>
            <h2 id="modalTitle"></h2>
            <input type="text" id="modalInput" class="futuristic-input" placeholder="Digite aqui...">
            <div class="modal-buttons">
                <button id="modalConfirm" class="futuristic-btn">Confirmar</button>
                <button id="modalCancel" class="futuristic-btn">Cancelar</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
