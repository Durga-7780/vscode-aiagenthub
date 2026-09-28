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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const EventBus_1 = require("./core/events/EventBus");
const AgentRegistry_1 = require("./core/agent/AgentRegistry");
const AgentLoader_1 = require("./core/agent/AgentLoader");
const ConfigManager_1 = require("./core/config/ConfigManager");
const IdeDetectionService_1 = require("./services/IdeDetectionService");
const AgentService_1 = require("./services/AgentService");
const AgentTreeProvider_1 = require("./ui/AgentTreeProvider");
const AgentPanel_1 = require("./ui/AgentPanel");
async function activate(context) {
    console.log('Activating AI Agent Hub...');
    const eventBus = new EventBus_1.EventBus();
    const registry = new AgentRegistry_1.AgentRegistry(eventBus);
    const agentLoader = new AgentLoader_1.AgentLoader(registry);
    const ideDetectionService = new IdeDetectionService_1.IdeDetectionService();
    const agentService = new AgentService_1.AgentService(registry, ideDetectionService, eventBus);
    const treeProvider = new AgentTreeProvider_1.AgentTreeProvider(registry);
    vscode.window.registerTreeDataProvider('aiAgentHubSidebar', treeProvider);
    // Initial load of agents in the background to avoid blocking activation
    let agentsDir = ConfigManager_1.ConfigManager.agentsPath;
    setTimeout(() => {
        const loadPromises = [];
        if (!agentsDir) {
            agentsDir = path.join(context.extensionPath, 'agents', 'examples');
            loadPromises.push(agentLoader.loadFromDirectory(path.join(context.extensionPath, 'agents')));
        }
        loadPromises.push(agentLoader.loadFromDirectory(agentsDir));
        Promise.all(loadPromises).then(() => {
            treeProvider.refresh();
            AgentPanel_1.AgentPanel.refresh();
        }).catch(console.error);
    }, 0);
    // Initialize adapters
    const vscodeAdapter = ideDetectionService.getAdapter('vscode');
    if (vscodeAdapter) {
        await vscodeAdapter.activate(context);
    }
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('aiAgentHub.open', () => {
        AgentPanel_1.AgentPanel.createOrShow(context.extensionUri, registry, ideDetectionService, agentService);
    }), vscode.commands.registerCommand('aiAgentHub.refreshAgents', async () => {
        await agentLoader.loadFromDirectory(agentsDir);
        treeProvider.refresh();
        AgentPanel_1.AgentPanel.refresh();
        vscode.window.showInformationMessage('AI Agent Hub: Agents refreshed');
    }), vscode.commands.registerCommand('aiAgentHub.selectAgent', async (agentId) => {
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
            }
            catch (e) {
                vscode.window.showErrorMessage(`Error: ${e.message}`);
            }
        }
    }), vscode.commands.registerCommand('aiAgentHub.showIntegrations', async () => {
        const env = await ideDetectionService.detectEnvironment();
        const message = `IDE: ${env.ide}\n` + env.integrations.map(i => `${i.id}: ${i.available ? 'Ready' : 'Not Available'}`).join('\n');
        vscode.window.showInformationMessage(`AI Agent Hub Integrations:\n${message}`, { modal: true });
    }), vscode.commands.registerCommand('aiAgentHub.reloadConfiguration', () => {
        vscode.window.showInformationMessage('AI Agent Hub configuration reloaded. (Please refresh agents to apply path changes)');
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('aiAgentHub')) {
            vscode.commands.executeCommand('aiAgentHub.reloadConfiguration');
        }
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map