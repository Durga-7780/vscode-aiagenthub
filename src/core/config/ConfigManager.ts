import * as vscode from 'vscode';

export class ConfigManager {
    static get agentsPath(): string {
        return vscode.workspace.getConfiguration('aiAgentHub').get<string>('agentsPath') || '';
    }

    static get defaultAgent(): string {
        return vscode.workspace.getConfiguration('aiAgentHub').get<string>('defaultAgent') || '';
    }

    static get defaultAdapter(): string {
        return vscode.workspace.getConfiguration('aiAgentHub').get<string>('defaultAdapter') || 'vscode';
    }

    static get enableTelemetry(): boolean {
        return vscode.workspace.getConfiguration('aiAgentHub').get<boolean>('enableTelemetry') || false;
    }
}
