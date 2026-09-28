import * as vscode from 'vscode';
import { AgentRegistry } from '../core/agent/AgentRegistry';
import { AgentDefinition } from '../core/agent/AgentDefinition';

export class AgentTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private registry: AgentRegistry) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const dashboardItem = new vscode.TreeItem("Open Agents Dashboard", vscode.TreeItemCollapsibleState.None);
            dashboardItem.iconPath = new vscode.ThemeIcon("dashboard");
            dashboardItem.command = {
                command: 'aiAgentHub.open',
                title: 'Open Dashboard'
            };
            
            const agents = this.registry.getAll();
            const agentItems = agents.map(a => new AgentItem(a));
            return Promise.resolve([dashboardItem, ...agentItems]);
        }
    }
}

export class AgentItem extends vscode.TreeItem {
    constructor(
        public readonly agent: AgentDefinition
    ) {
        super(agent.name, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${this.agent.name}-${this.agent.version}`;
        this.description = this.agent.description;
        this.command = {
            command: 'aiAgentHub.selectAgent',
            title: 'Select Agent',
            arguments: [this.agent.id]
        };
    }
}
