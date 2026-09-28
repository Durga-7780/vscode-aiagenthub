import * as vscode from 'vscode';
import * as path from 'path';
import { AgentRegistry } from '../core/agent/AgentRegistry';
import { IdeDetectionService } from '../services/IdeDetectionService';
import { AgentService } from '../services/AgentService';
import { GitHubAgentService } from '../services/GitHubAgentService';
import { AgentDefinition } from '../core/agent/AgentDefinition';

export class AgentPanel {
    public static readonly viewType = 'aiAgentHubSidebar';
    private static currentPanel: AgentPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;

    private constructor(
        panel: vscode.WebviewPanel,
        private readonly _extensionUri: vscode.Uri,
        private registry: AgentRegistry,
        private ideDetection: IdeDetectionService,
        private agentService: AgentService,
        private githubAgentService: GitHubAgentService = new GitHubAgentService()
    ) {
        this._panel = panel;

        this._panel.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        this._panel.webview.onDidReceiveMessage(async (data: any) => {
            switch (data.type) {
                case 'refreshAgents': {
                    this._panel.webview.postMessage({ type: 'agentsLoading' });
                    try {
                        const agents = await this.githubAgentService.fetchAgents();
                        this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
                    } catch (err: any) {
                        this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message });
                    }
                    break;
                }
                case 'executeAgent': {
                     try {
                        await this.agentService.executeAgent(data.agentId);
                    } catch (err: any) {
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
                        
                        let agentsToApply: AgentDefinition[] = [];
                        try {
                            const agents = await this.githubAgentService.fetchAgents();
                            agentsToApply = agents.filter(a => data.agentIds.includes(a.id));
                        } catch(e) {
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
                    } catch (err: any) {
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

    public static createOrShow(
        extensionUri: vscode.Uri,
        registry: AgentRegistry,
        ideDetection: IdeDetectionService,
        agentService: AgentService
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AgentPanel.currentPanel) {
            AgentPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            AgentPanel.viewType,
            'Agents Dashboard',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        AgentPanel.currentPanel = new AgentPanel(panel, extensionUri, registry, ideDetection, agentService);
    }

    public static async refresh() {
        if (AgentPanel.currentPanel) {
            await AgentPanel.currentPanel.triggerInitialLoad();
        }
    }

    private async triggerInitialLoad() {
        this._panel.webview.postMessage({ type: 'agentsLoading' });
        try {
            const agents = await this.githubAgentService.fetchAgents();
            this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
        } catch (err: any) {
            const agents = this.registry.getAll();
            if (agents && agents.length > 0) {
                 this._panel.webview.postMessage({ type: 'agentsLoaded', agents });
                 vscode.window.showWarningMessage('GitHub unavailable, loaded agents from last known state.');
            } else {
                 this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message });
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
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
