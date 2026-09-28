import { AgentRegistry } from '../core/agent/AgentRegistry';
import { IdeDetectionService } from './IdeDetectionService';
import { EventBus } from '../core/events/EventBus';
import { ConfigManager } from '../core/config/ConfigManager';

export class AgentService {
    constructor(
        private registry: AgentRegistry,
        private ideDetection: IdeDetectionService,
        private eventBus: EventBus
    ) {}

    async executeAgent(agentId: string): Promise<void> {
        const agent = this.registry.getById(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }

        this.eventBus.emit('agentSelected', agentId);
        console.log(`Agent selected: ${agent.id}`);

        const environment = await this.ideDetection.detectEnvironment();
        
        let adapterIdToUse = ConfigManager.defaultAdapter;
        
        let adapter = this.ideDetection.getAdapter(adapterIdToUse);

        if (!adapter || !(await adapter.isAvailable())) {
             console.log(`Adapter ${adapterIdToUse} is not available, falling back to vscode adapter.`);
             adapter = this.ideDetection.getAdapter('vscode');
        }

        if (adapter) {
            console.log(`Integration: ${adapter.constructor.name}\nStatus: Ready`);
            await adapter.sendAgent(agent);
            this.eventBus.emit('agentExecutionRequested', { agentId: agent.id, adapterId: adapter.id });
        } else {
            console.log(`Integration: None\nStatus: Not Available`);
            throw new Error('No available IDE adapter to execute the agent.');
        }
    }
}
