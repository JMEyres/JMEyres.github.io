// --- CONFIGURATION ---
const GITHUB_CONFIG = {
  owner: 'JMEyres',           // Your GitHub username
  repo: 'JMEyres.github.io', // Your repository name
  branch: 'main',             // Branch to commit to (e.g. 'test-admin' for testing)
  dataPath: 'JS/projects.json'   // Relative path to your JSON data
};

// Global State
let projects = {};
let currentActiveId = null;

// DOM Elements
const listContainer = document.getElementById('project-list');
const searchInput = document.getElementById('project-search');
const modal = document.getElementById('admin-modal');
const adminForm = document.getElementById('admin-form');

// --- 1. GITHUB API & AUTH HELPERS ---

function getGitHubToken() {
  let token = localStorage.getItem('gh_portfolio_token');
  if (!token) {
    token = prompt('Enter GitHub Personal Access Token (PAT):');
    if (token) {
      localStorage.setItem('gh_portfolio_token', token.trim());
    }
  }
  return token;
}

// Convert File object to raw base64 string
const fileToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});

// Commit an uploaded file directly to /Images/
async function uploadGitHubAsset(filePath, base64Content, commitMessage) {
  const token = getGitHubToken();
  if (!token) throw new Error("Authentication token required.");

  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;

  // Check if file exists to fetch its SHA for overwrite
  let sha;
  try {
    const existing = await fetch(url, {
      credentials: 'omit',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
  } catch (err) {}

  const res = await fetch(url, {
    method: 'PUT',
    credentials: 'omit',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      branch: GITHUB_CONFIG.branch,
      ...(sha ? { sha } : {})
    })
  });

  if (!res.ok) throw new Error(`Asset upload failed: ${res.statusText}`);
  return await res.json();
}

// Update projects.json with new structure
async function commitProjectsJson(newProjectsData, commitMessage) {
  const token = getGitHubToken();
  if (!token) throw new Error("Authentication token required.");

  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataPath}`;

  // Get current blob SHA
  const getRes = await fetch(url, {
    credentials: 'omit',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!getRes.ok) throw new Error("Could not retrieve current projects.json SHA.");
  const meta = await getRes.json();

  // UTF-8 safe base64 encoding
  const jsonString = JSON.stringify(newProjectsData, null, 2);
  const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

  const putRes = await fetch(url, {
    method: 'PUT',
    credentials: 'omit',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: base64Content,
      sha: meta.sha,
      branch: GITHUB_CONFIG.branch
    })
  });

  if (!putRes.ok) throw new Error(`Failed to commit JSON: ${putRes.statusText}`);
  return await putRes.json();
}

// --- 2. ADMIN UI & MODAL MANAGEMENT ---

function enableAdminControls() {
  const titleBar = document.querySelector('.retro-window .titlebar');
  if (!titleBar || document.getElementById('admin-actions-bar')) return;

  const bar = document.createElement('span');
  bar.id = 'admin-actions-bar';
  bar.innerHTML = `
    <button type="button" class="admin-btn" id="admin-new-btn">+ NEW</button>
    <button type="button" class="admin-btn" id="admin-edit-btn">EDIT CURRENT</button>
  `;
  titleBar.appendChild(bar);

  document.getElementById('admin-new-btn').onclick = () => openAdminModal();
  document.getElementById('admin-edit-btn').onclick = () => {
    if (currentActiveId && projects[currentActiveId]) {
      openAdminModal(currentActiveId);
    } else {
      alert("Select a project first to edit.");
    }
  };
}

function openAdminModal(keyToEdit = null) {
  if (!modal || !adminForm) return;

  adminForm.reset();
  document.getElementById('current-main-img-label').innerText = '';
  document.getElementById('current-gallery-label').innerText = '';

  if (keyToEdit) {
    const data = projects[keyToEdit];
    document.getElementById('modal-heading').innerText = `> EDIT: ${keyToEdit}`;
    document.getElementById('edit-project-key').value = keyToEdit;
    document.getElementById('form-key').value = keyToEdit;
    document.getElementById('form-key').disabled = true;
    document.getElementById('form-dirtitle').value = data.dirTitle || '';
    document.getElementById('form-title').value = data.title || '';
    document.getElementById('form-desc').value = data.description || '';

    if (data.imgPath) {
      document.getElementById('current-main-img-label').innerText = `Current: ${data.imgPath}`;
    }
    if (data.gallery && data.gallery.length) {
      document.getElementById('current-gallery-label').innerText = `Existing images: ${data.gallery.length}`;
    }
  } else {
    document.getElementById('modal-heading').innerText = '> NEW ENTRY';
    document.getElementById('edit-project-key').value = '';
    document.getElementById('form-key').disabled = false;
  }

  modal.classList.add('open');
}

// --- 3. FORM SUBMISSION PIPELINE ---

if (adminForm) {
  adminForm.onsubmit = async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('modal-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'COMMITTING...';

    try {
      const editKey = document.getElementById('edit-project-key').value;
      const key = editKey || document.getElementById('form-key').value.trim().toLowerCase().replace(/\s+/g, '-');
      const dirTitle = document.getElementById('form-dirtitle').value.trim();
      const title = document.getElementById('form-title').value.trim();
      const desc = document.getElementById('form-desc').value.trim();

      const mainFileInput = document.getElementById('form-main-img').files[0];
      const galleryFiles = Array.from(document.getElementById('form-gallery-imgs').files);

      const existingData = projects[key] || { gallery: [] };
      let mainImgPath = existingData.imgPath || '';
      let galleryPaths = [...(existingData.gallery || [])];

      // 1. Upload main image
      if (mainFileInput) {
        saveBtn.innerText = 'UPLOADING MAIN IMAGE...';
        const cleanName = `${key}-main-${Date.now()}.${mainFileInput.name.split('.').pop()}`;
        const base64 = await fileToBase64(mainFileInput);
        await uploadGitHubAsset(`Images/${cleanName}`, base64, `Upload main image for ${key}`);
        mainImgPath = `Images/${cleanName}`;
      }

      // 2. Upload gallery images
      for (let i = 0; i < galleryFiles.length; i++) {
        saveBtn.innerText = `UPLOADING GALLERY [${i + 1}/${galleryFiles.length}]...`;
        const file = galleryFiles[i];
        const cleanName = `${key}-gallery-${Date.now()}-${i}.${file.name.split('.').pop()}`;
        const base64 = await fileToBase64(file);
        await uploadGitHubAsset(`Images/${cleanName}`, base64, `Upload gallery asset for ${key}`);
        galleryPaths.push(`Images/${cleanName}`);
      }

      // 3. Update local state and commit JSON
      saveBtn.innerText = 'UPDATING REPO DATA...';
      projects[key] = {
        dirTitle: dirTitle,
        title: title,
        description: desc,
        icon: existingData.icon || '',
        imgPath: mainImgPath,
        gallery: galleryPaths
      };

      await commitProjectsJson(projects, `Update project entry: ${key}`);

      alert('Committed successfully! GitHub Pages will reflect changes in ~1 minute.');
      modal.classList.remove('open');
      buildDirectory();
      loadProject(key);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = 'COMMIT TO REPO';
    }
  };
}

const cancelBtn = document.getElementById('modal-cancel-btn');
if (cancelBtn) {
  cancelBtn.onclick = () => modal.classList.remove('open');
}

// --- 4. CORE DIRECTORY & DISPLAY LOGIC ---

function loadProject(id) {
  const data = projects[id];
  if (!data) return;
  currentActiveId = id;

  const mainImg = document.getElementById('proj-img');
  const galleryArea = document.getElementById('gallery-area');
  const galleryHeader = document.getElementById('gallery-header');

  document.getElementById('proj-title').innerText = data.title;
  document.getElementById('proj-header').innerText = data.title;
  document.getElementById('proj-desc').innerText = data.description;
  document.getElementById('proj-icon').src = data.icon || '';

  if (data.imgPath) {
    mainImg.src = data.imgPath;
    mainImg.style.display = "block";
    mainImg.style.opacity = "0";
    mainImg.onload = () => { mainImg.style.opacity = "1"; };
    document.getElementById('window-container').style.setProperty('--window-bg', `url('${data.imgPath}')`);
  } else {
    mainImg.style.display = "none";
    document.getElementById('window-container').style.setProperty('--window-bg', 'none');
  }

  galleryArea.innerHTML = '';
  if (data.gallery && data.gallery.length > 0) {
    galleryHeader.classList.remove('hidden');
    data.gallery.forEach(src => {
      const figure = document.createElement('figure');
      figure.className = "gallery-item";

      const extraImg = document.createElement('img');
      extraImg.src = src;
      extraImg.className = "gallery-thumb";
      extraImg.onclick = () => window.open(src, '_blank');

      const caption = document.createElement('figcaption');
      const fileName = src.split('/').pop().split('.')[0];
      caption.innerText = fileName.replace(/[-_]/g, ' ').toUpperCase();
      caption.className = "gallery-caption";

      figure.appendChild(extraImg);
      figure.appendChild(caption);
      galleryArea.appendChild(figure);
    });
  } else {
    galleryHeader.classList.add('hidden');
  }

  window.history.pushState(null, '', `?id=${id}`);
}

function buildDirectory() {
  if (!listContainer) return;
  listContainer.innerHTML = '';

  Object.keys(projects).forEach(key => {
    const listItem = document.createElement('li');
    const project = projects[key];

    const link = document.createElement('a');
    link.href = `?id=${key}`;
    link.className = "sidebar-link";
    link.innerText = project.dirTitle;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadProject(key);
      if (window.innerWidth < 768) {
        listContainer.classList.add('collapsed');
        updatePlaceholderState();
      }
    });

    listItem.appendChild(link);
    listContainer.appendChild(listItem);
  });
}

function updatePlaceholderState() {
  if (!searchInput || !listContainer) return;
  if (listContainer.classList.contains('collapsed')) {
    searchInput.placeholder = "Search directory... (Click header to expand)";
  } else {
    searchInput.placeholder = "Search directory...";
  }
}

// --- 5. INITIALIZATION ---

window.addEventListener('DOMContentLoaded', async () => {
  const galleryHeader = document.getElementById('gallery-header');
  if (galleryHeader) galleryHeader.classList.add('hidden');

  // Search filter listener
  if (searchInput && listContainer) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const items = listContainer.getElementsByTagName('li');
      Array.from(items).forEach(item => {
        const title = item.textContent.toLowerCase();
        item.style.display = title.includes(term) ? 'block' : 'none';
      });
    });

    searchInput.addEventListener('focus', () => {
      listContainer.classList.remove('collapsed');
      updatePlaceholderState();
    });
  }

  // Directory header collapse toggle
  const dirHeader = document.querySelector('.directory-header');
  if (dirHeader && listContainer) {
    dirHeader.style.cursor = 'pointer';
    dirHeader.addEventListener('click', () => {
      listContainer.classList.toggle('collapsed');
      updatePlaceholderState();
    });
  }

  // Admin Hotkey (Ctrl + Shift + A)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
      enableAdminControls();
    }
  });

  // Footer Copyright Admin Click
  const copyright = document.querySelector('.tiny-copyright');
  if (copyright) {
    copyright.style.cursor = 'pointer';
    copyright.title = 'Click to toggle Admin Mode';
    copyright.addEventListener('click', () => enableAdminControls());
  }

  // Fetch JSON database
  try {
    const res = await fetch(GITHUB_CONFIG.dataPath + '?t=' + Date.now());
    projects = await res.json();
    buildDirectory();

    const params = new URLSearchParams(window.location.search);
    const initialId = params.get('id');
    if (initialId && projects[initialId]) {
      loadProject(initialId);
      if (window.innerWidth < 768 && listContainer) {
        listContainer.classList.add('collapsed');
      }
    }
    updatePlaceholderState();
  } catch (err) {
    console.error('Failed to load projects.json:', err);
  }

  // Restore Admin controls if authenticated previously on this device
  if (localStorage.getItem('gh_portfolio_token')) {
    enableAdminControls();
  }
});