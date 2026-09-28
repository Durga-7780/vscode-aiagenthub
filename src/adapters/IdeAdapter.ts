import { AgentDefinition } from '../core/agent/AgentDefinition';

export interface IdeAdapter {
    readonly id: string;
    isAvailable(): Promise<boolean>;
    activate(context?: import('vscode').ExtensionContext): Promise<void>;
    sendAgent(agent: AgentDefinition): Promise<void>;
    sendPrompt(prompt: string): Promise<void>;
}
