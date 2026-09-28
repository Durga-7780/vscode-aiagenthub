import { IdeAdapter } from '../IdeAdapter';
import { AgentDefinition } from '../../core/agent/AgentDefinition';

export class CursorAdapter implements IdeAdapter {
    id = 'cursor';

    async isAvailable(): Promise<boolean> {
        // Phase 1: Not fully configured, detecting by environment variables or command availability
        const isCursorEnvironment = process.env.CURSOR_APP === 'true' || false;
        return isCursorEnvironment;
    }

    async activate(): Promise<void> {
        console.log('CursorAdapter activated');
    }

    async sendAgent(agent: AgentDefinition): Promise<void> {
        console.log(`[Cursor Adapter] Not currently supported via formal API. Status: MOCK.`);
    }

    async sendPrompt(prompt: string): Promise<void> {
        console.log(`[Cursor Adapter] Mock sendPrompt.`);
    }
}
