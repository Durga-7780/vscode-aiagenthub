const vscode = acquireVsCodeApi();

let loadedAgents = [];
let selectedAgentIds = new Set();
let isLoading = false;
let errorMessage = null;
<<<<<<< HEAD
=======
let errorTimeout = null;
>>>>>>> origin/ui-changes

const refreshBtn = document.getElementById('refreshBtn');
const applyBtn = document.getElementById('applyBtn');
const contentArea = document.getElementById('contentArea');

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.type) {
        case 'agentsLoading':
            isLoading = true;
            errorMessage = null;
            render();
            break;
        case 'agentsLoaded':
            isLoading = false;
            errorMessage = null;
            loadedAgents = message.agents || [];
            // Preserve selection if possible
            const loadedIds = new Set(loadedAgents.map(a => a.id));
            for (const id of selectedAgentIds) {
                if (!loadedIds.has(id)) {
                    selectedAgentIds.delete(id);
                }
            }
            render();
            break;
        case 'agentsRefreshError':
            isLoading = false;
<<<<<<< HEAD
            errorMessage = message.message;
=======
            showToastError("Unable to refresh agents from GitHub. " + message.message);
            if (message.fallbackAgents) {
                loadedAgents = message.fallbackAgents || [];
            }
>>>>>>> origin/ui-changes
            render();
            break;
        case 'agentsApplied':
            // we could show a success message
            break;
    }
});

refreshBtn.addEventListener('click', () => {
    vscode.postMessage({ type: 'refreshAgents' });
    isLoading = true;
    errorMessage = null;
    render();
});

applyBtn.addEventListener('click', () => {
    vscode.postMessage({
        type: 'applyAgents',
        agentIds: Array.from(selectedAgentIds)
    });
});

function toggleSelection(agentId, isSelected) {
    if (isSelected) {
        selectedAgentIds.add(agentId);
    } else {
        selectedAgentIds.delete(agentId);
    }
    applyBtn.disabled = selectedAgentIds.size === 0;
<<<<<<< HEAD
=======
    
    // Update the visual styling of the card directly
    const checkbox = document.querySelector(`input[data-agent-id="${agentId}"]`);
    if (checkbox) {
        const item = checkbox.closest('.agent-item');
        if (item) {
            if (isSelected) item.classList.add('selected');
            else item.classList.remove('selected');
        }
    }
>>>>>>> origin/ui-changes
}

function handleExecute(agentId) {
    vscode.postMessage({
        type: 'executeAgent',
        agentId: agentId
    });
}

<<<<<<< HEAD
=======
function showToastError(msg) {
    if (errorTimeout) clearTimeout(errorTimeout);
    
    let toast = document.getElementById('error-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'error-toast';
        document.body.appendChild(toast);
    }
    
    toast.textContent = msg;
    toast.className = 'toast show';
    
    errorTimeout = setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

>>>>>>> origin/ui-changes
function render() {
    refreshBtn.disabled = isLoading;
    applyBtn.disabled = selectedAgentIds.size === 0 || isLoading;

<<<<<<< HEAD
    if (isLoading) {
        contentArea.innerHTML = '<div class="loading-state">Refreshing agents...</div>';
        return;
    }

    if (errorMessage) {
        contentArea.innerHTML = `<div class="error-state">
            <p>Unable to refresh agents from GitHub.</p>
            <p>${errorMessage}</p>
        </div>`;
=======
    if (isLoading && loadedAgents.length === 0) {
        contentArea.innerHTML = '<div class="loading-state">Loading agents...</div>';
>>>>>>> origin/ui-changes
        return;
    }

    if (loadedAgents.length === 0) {
        contentArea.innerHTML = '<div class="empty-state">No agents available.</div>';
        return;
    }

    // Group by category
    const grouped = {};
    for (const agent of loadedAgents) {
<<<<<<< HEAD
        const cat = agent.category || 'Uncategorized';
=======
        const cat = agent.category || 'Development';
>>>>>>> origin/ui-changes
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(agent);
    }

    let html = '';
    for (const [category, agents] of Object.entries(grouped)) {
        html += `<div class="category">
            <div class="category-title">${category}</div>
            <div class="category-agents">`;
        
        for (const agent of agents) {
            const isChecked = selectedAgentIds.has(agent.id) ? 'checked' : '';
<<<<<<< HEAD
=======
            const selectedClass = selectedAgentIds.has(agent.id) ? 'selected' : '';
>>>>>>> origin/ui-changes
            const execBtn = agent.executable 
                ? `<button class="execute-btn" data-exec-id="${agent.id}" title="Execute Agent">▶</button>` 
                : '';
                
<<<<<<< HEAD
            const desc = agent.description ? `<div class="agent-desc">${agent.description}</div>` : '';
            
            html += `
            <div class="agent-item">
                <label>
                    <input type="checkbox" data-agent-id="${agent.id}" ${isChecked}>
                    <div class="agent-info">
                        <div class="agent-name">${agent.name}</div>
=======
            const inputDesc = agent.inputDescription || 'Dependencies, requirements, or source code context.';
            const outputDesc = agent.outputDescription || 'Implementation, guidance, and direct project modifications.';
            
            const infoIcon = `
            <div class="info-icon">ⓘ
                <div class="custom-tooltip">
                    <strong>Input:</strong> ${inputDesc}<br>
                    <strong>Output:</strong> ${outputDesc}
                </div>
            </div>`;

            const desc = agent.description ? `<div class="agent-desc">${agent.description}</div>` : '';
            
            html += `
            <div class="agent-item ${selectedClass}">
                <label>
                    <input type="checkbox" data-agent-id="${agent.id}" ${isChecked}>
                    <div class="agent-info">
                        <div class="agent-name">${agent.name} ${infoIcon}</div>
>>>>>>> origin/ui-changes
                        ${desc}
                    </div>
                </label>
                ${execBtn}
            </div>`;
        }
        
        html += `</div></div>`;
    }

    contentArea.innerHTML = html;

    // Attach events
    const checkboxes = contentArea.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            toggleSelection(e.target.dataset.agentId, e.target.checked);
        });
    });

    const execBtns = contentArea.querySelectorAll('.execute-btn');
    execBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleExecute(e.target.dataset.execId);
        });
    });
}
