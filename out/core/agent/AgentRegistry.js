"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    agents = new Map();
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    register(agent) {
        this.agents.set(agent.id, agent);
        this.eventBus.emit('agentRegistered', agent.id);
    }
    unregister(id) {
        if (this.agents.has(id)) {
            this.agents.delete(id);
            this.eventBus.emit('agentRemoved', id);
        }
    }
    getById(id) {
        return this.agents.get(id);
    }
    getAll() {
        return Array.from(this.agents.values());
    }
    exists(id) {
        return this.agents.has(id);
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=AgentRegistry.js.map