import * as vscode from 'vscode';
import * as path from 'path';
import { EventBus } from './core/events/EventBus';
import { AgentRegistry } from './core/agent/AgentRegistry';
import { AgentLoader } from './core/agent/AgentLoader';
import { ConfigManager } from './core/config/ConfigManager';
import { IdeDetectionService } from './services/IdeDetectionService';
import { AgentService } from './services/AgentService';
import { AgentTreeProvider } from './ui/AgentTreeProvider';
import { AgentPanel } from './ui/AgentPanel';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Activating AI Agent Hub...');

    const eventBus = new EventBus();
    const registry = new AgentRegistry(eventBus);
    const agentLoader = new AgentLoader(registry);
    const ideDetectionService = new IdeDetectionService();
    const agentService = new AgentService(registry, ideDetectionService, eventBus);

    const treeProvider = new AgentTreeProvider(registry);
    vscode.window.registerTreeDataProvider('aiAgentHubSidebar', treeProvider);

    // Initial load of agents in the background to avoid blocking activation
    let agentsDir = ConfigManager.agentsPath;
    
    setTimeout(() => {
        const loadPromises = [];
        if (!agentsDir) {
            agentsDir = path.join(context.extensionPath, 'agents', 'examples');
            loadPromises.push(agentLoader.loadFromDirectory(path.join(context.extensionPath, 'agents')));
        }
        loadPromises.push(agentLoader.loadFromDirectory(agentsDir));
        
        Promise.all(loadPromises).then(() => {
            treeProvider.refresh();
            AgentPanel.refresh();
        }).catch(console.error);
    }, 0);

    // Initialize adapters
    const vscodeAdapter = ideDetectionService.getAdapter('vscode');
    if (vscodeAdapter) {
        await vscodeAdapter.activate(context);
    }

    // Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('aiAgentHub.open', () => {
            AgentPanel.createOrShow(context.extensionUri, registry, ideDetectionService, agentService);
        }),
        vscode.commands.registerCommand('aiAgentHub.refreshAgents', async () => {
            await agentLoader.loadFromDirectory(agentsDir);
            treeProvider.refresh();
            AgentPanel.refresh();
            vscode.window.showInformationMessage('AI Agent Hub: Agents refreshed');
        }),
        vscode.commands.registerCommand('aiAgentHub.selectAgent', async (agentId?: string) => {
            if (!agentId) {
                const agents = registry.getAll().map(a => ({ label: a.name, description: a.description, id: a.id }));
                const picked = await vscode.window.showQuickPick(agents, { placeHolder: 'Select an Agent' });
                if (picked) {
                    agentId = picked.id;
                }
            }

            if (agentId) {
                try {
                    await agentService.executeAgent(agentId);
                    vscode.window.showInformationMessage(`Agent execution requested: ${agentId}`);
                } catch (e: any) {
                    vscode.window.showErrorMessage(`Error: ${e.message}`);
                }
            }
        }),
        vscode.commands.registerCommand('aiAgentHub.showIntegrations', async () => {
            const env = await ideDetectionService.detectEnvironment();
            const message = `IDE: ${env.ide}\n` + env.integrations.map(i => `${i.id}: ${i.available ? 'Ready' : 'Not Available'}`).join('\n');
            vscode.window.showInformationMessage(`AI Agent Hub Integrations:\n${message}`, { modal: true });
        }),
        vscode.commands.registerCommand('aiAgentHub.reloadConfiguration', () => {
            vscode.window.showInformationMessage('AI Agent Hub configuration reloaded. (Please refresh agents to apply path changes)');
        })
    );

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('aiAgentHub')) {
            vscode.commands.executeCommand('aiAgentHub.reloadConfiguration');
        }
    }));
}

export function deactivate() {}
