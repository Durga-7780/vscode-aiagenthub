"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const GitHubAgentService_1 = require("../services/GitHubAgentService");
class AgentPanel {
    _extensionUri;
    registry;
    ideDetection;
    agentService;
    githubAgentService;
    static viewType = 'aiAgentHubSidebar';
    static currentPanel;
    _panel;
    constructor(panel, _extensionUri, registry, ideDetection, agentService, githubAgentService = new GitHubAgentService_1.GitHubAgentService()) {
        this._extensionUri = _extensionUri;
        this.registry = registry;
        this.ideDetection = ideDetection;
        this.agentService = agentService;
        this.githubAgentService = githubAgentService;
        this._panel = panel;
        this._panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
        this._panel.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'refreshAgents': {
                    this._panel.webview.postMessage({ type: 'agentsLoading' });
                    try {
                        const agents = await this.githubAgentService.fetchAgents();
                        this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
                    }
                    catch (err) {
                        this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message });
                    }
                    break;
                }
                case 'executeAgent': {
                    try {
                        await this.agentService.executeAgent(data.agentId);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage("Failed to execute agent: " + err.message);
                    }
                    break;
                }
                case 'applyAgents': {
                    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                        vscode.window.showErrorMessage('Open a workspace to install agents.');
                        return;
                    }
                    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
                    const agentsDir = path.join(workspaceRoot, '.github', 'agents');
                    const fs = require('fs');
                    try {
                        if (!fs.existsSync(agentsDir)) {
                            fs.mkdirSync(agentsDir, { recursive: true });
                        }
                        let agentsToApply = [];
                        try {
                            const agents = await this.githubAgentService.fetchAgents();
                            agentsToApply = agents.filter(a => data.agentIds.includes(a.id));
                        }
                        catch (e) {
                            agentsToApply = this.registry.getAll().filter(a => data.agentIds.includes(a.id));
                        }
                        for (const agent of agentsToApply) {
                            const filePath = path.join(agentsDir, agent.id + '.md');
                            const mdContent = "---\n" +
                                "id: " + agent.id + "\n" +
                                "name: " + agent.name + "\n" +
                                "description: " + (agent.description || '') + "\n" +
                                "version: " + (agent.version || '1.0.0') + "\n" +
                                "category: " + (agent.category || '') + "\n" +
                                "executable: " + (agent.executable ? 'true' : 'false') + "\n" +
                                "---\n\n" +
                                "# " + agent.name + "\n\n" +
                                (agent.instructions || '') + "\n";
                            fs.writeFileSync(filePath, mdContent, 'utf8');
                        }
                        this._panel.webview.postMessage({ type: 'agentsApplied', agentIds: data.agentIds });
                        vscode.window.showInformationMessage("Applied " + agentsToApply.length + " agents to workspace.");
                    }
                    catch (err) {
                        vscode.window.showErrorMessage("Failed to apply agents: " + err.message);
                    }
                    break;
                }
            }
        });
        this._panel.onDidDispose(() => {
            AgentPanel.currentPanel = undefined;
        });
        this.triggerInitialLoad();
    }
    static createOrShow(extensionUri, registry, ideDetection, agentService) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (AgentPanel.currentPanel) {
            AgentPanel.currentPanel._panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel(AgentPanel.viewType, 'Agents Dashboard', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [extensionUri]
        });
        AgentPanel.currentPanel = new AgentPanel(panel, extensionUri, registry, ideDetection, agentService);
    }
    static async refresh() {
        if (AgentPanel.currentPanel) {
            await AgentPanel.currentPanel.triggerInitialLoad();
        }
    }
    async triggerInitialLoad() {
        this._panel.webview.postMessage({ type: 'agentsLoading' });
        try {
            const agents = await this.githubAgentService.fetchAgents();
            this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
        }
        catch (err) {
            const agents = this.registry.getAll();
            if (agents && agents.length > 0) {
                this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
                vscode.window.showWarningMessage('GitHub unavailable, loaded agents from last known state.');
            }
            else {
                this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message });
            }
        }
    }
    _getHtmlForWebview(webview) {
        const indexHtmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'ui', 'webview', 'index.html');
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'ui', 'webview', 'app.js');
        const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'src', 'ui', 'webview', 'styles.css');
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        const styleUri = webview.asWebviewUri(stylePathOnDisk);
        const fs = require('fs');
        let html = fs.readFileSync(indexHtmlPath.fsPath, 'utf8');
        html = html.replace('app.js', scriptUri.toString());
        html = html.replace('styles.css', styleUri.toString());
        return html;
    }
}
exports.AgentPanel = AgentPanel;
//# sourceMappingURL=AgentPanel.js.map