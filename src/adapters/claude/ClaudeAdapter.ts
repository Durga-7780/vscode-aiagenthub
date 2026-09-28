import { IdeAdapter } from '../IdeAdapter';
import { AgentDefinition } from '../../core/agent/AgentDefinition';

export class ClaudeAdapter implements IdeAdapter {
    id = 'claude';

    async isAvailable(): Promise<boolean> {
        // Phase 1: Not fully configured, assuming not available by default
        return false;
    }

    async activate(): Promise<void> {
        console.log('ClaudeAdapter activated');
    }

    async sendAgent(agent: AgentDefinition): Promise<void> {
        console.log(`[Claude Adapter] Unsupported or Not Configured.`);
    }

    async sendPrompt(prompt: string): Promise<void> {
        console.log(`[Claude Adapter] Mock sendPrompt.`);
    }
}
