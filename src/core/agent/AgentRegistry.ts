import { EventBus } from '../events/EventBus';
import { AgentDefinition } from './AgentDefinition';

export class AgentRegistry {
    private agents = new Map<string, AgentDefinition>();
    private eventBus: EventBus;

    constructor(eventBus: EventBus) {
        this.eventBus = eventBus;
    }

    register(agent: AgentDefinition): void {
        this.agents.set(agent.id, agent);
        this.eventBus.emit('agentRegistered', agent.id);
    }

    unregister(id: string): void {
        if (this.agents.has(id)) {
            this.agents.delete(id);
            this.eventBus.emit('agentRemoved', id);
        }
    }

    getById(id: string): AgentDefinition | undefined {
        return this.agents.get(id);
    }

    getAll(): AgentDefinition[] {
        return Array.from(this.agents.values());
    }

    exists(id: string): boolean {
        return this.agents.has(id);
    }
}
