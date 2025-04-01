:root {
    --primary-dark: #1a1a1a;
    --secondary-dark: #2d2d2d;
    --accent-dark: #4a90e2;
    --text-dark: #ffffff;
    --primary-light: #ffffff;
    --secondary-light: #f5f5f5;
    --accent-light: #4a90e2;
    --text-light: #333333;
}

body {
    font-family: 'Segoe UI', Arial, sans-serif;
    margin: 0;
    padding: 0;
    transition: all 0.3s ease;
}

body.theme-dark {
    background-color: var(--primary-dark);
    color: var(--text-dark);
}

body.theme-light {
    background-color: var(--primary-light);
    color: var(--text-light);
}

#menu {
    width: 250px;
    height: 100vh;
    position: fixed;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.theme-dark #menu { background-color: var(--secondary-dark); }
.theme-light #menu { background-color: var(--secondary-light); }

#menu h1 {
    margin: 0 0 20px;
    font-size: 1.5em;
    display: flex;
    align-items: center;
    gap: 10px;
}

#menu button, #menu input {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    border: none;
    border-radius: 5px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
}

.theme-dark #menu button { 
    background-color: var(--accent-dark);
    color: white;
}

.theme-dark #menu input {
    background-color: #333;
    color: white;
}

.theme-light #menu button {
    background-color: var(--accent-light);
    color: white;
}

.theme-light #menu input {
    background-color: #eee;
    color: #333;
}

#menu button:hover {
    opacity: 0.9;
}

#main-content {
    margin-left: 270px;
    padding: 20px;
}

.path-breadcrumbs {
    margin-bottom: 15px;
    font-size: 0.9em;
    opacity: 0.8;
    cursor: pointer;
}

.path-breadcrumbs span:hover {
    text-decoration: underline;
}

#fileList {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 10px;
}

#fileList li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.theme-dark #fileList li {
    background-color: var(--secondary-dark);
    border: 1px solid #444;
}

.theme-light #fileList li {
    background-color: var(--secondary-light);
    border: 1px solid #ddd;
}

#fileList li:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.folder { 
    font-weight: 600;
    color: var(--accent-dark);
}

.folder::before {
    content: '📁 ';
    margin-right: 5px;
}

.buttons button {
    padding: 8px 12px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    background-color: var(--accent-dark);
    color: white;
    transition: all 0.3s ease;
}

.buttons button:hover {
    opacity: 0.9;
}

#viewer {
    display: none;
    position: fixed;
    top: 0;
    right: 0;
    width: 50%;
    height: 100vh;
    background-color: rgba(0,0,0,0.9);
    padding: 20px;
    flex-direction: column;
    align-items: center;
}

#closeViewer {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #e74c3c;
}
