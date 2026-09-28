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
                        this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message, fallbackAgents: this.registry.getAll() });
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
                            const agentFolder = path.join(agentsDir, agent.id || agent.name.replace(/\s+/g, '-').toLowerCase());
                            if (!fs.existsSync(agentFolder)) {
                                fs.mkdirSync(agentFolder, { recursive: true });
                            }
                            
                            const skillFileName = agent.skillFile || 'skill.md';
                            const skillFilePath = path.join(agentFolder, skillFileName);
                            const agentJsonPath = path.join(agentFolder, 'agent.json');
                            
                            // Write skill.md containing the instructions
                            if (agent.instructions) {
                                fs.writeFileSync(skillFilePath, agent.instructions, 'utf8');
                            } else {
                                fs.writeFileSync(skillFilePath, `# ${agent.name}\n`, 'utf8');
                            }
                            
                            // Write agent.json metadata
                            const agentJson = { ...agent, instructions: undefined, skillFile: skillFileName };
                            fs.writeFileSync(agentJsonPath, JSON.stringify(agentJson, null, 2), 'utf8');
                            
                            this.registry.register(agent);
                        }
                        
                        // Force a refresh of the sidebar tree provider to immediately reflect applied agents
                        vscode.commands.executeCommand('aiAgentHub.refreshAgents');
                        
                        this._panel.webview.postMessage({ type: 'agentsApplied', agentIds: data.agentIds });
                        vscode.window.showInformationMessage(`Applied ${agentsToApply.length} agent(s) to workspace.`);
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
            this._panel.webview.postMessage({ type: 'agentsRefreshError', message: err.message, fallbackAgents: agents });
            if (agents && agents.length > 0) {
                 vscode.window.showWarningMessage('GitHub unavailable, loaded agents from last known state.');
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
