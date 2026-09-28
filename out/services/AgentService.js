"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const ConfigManager_1 = require("../core/config/ConfigManager");
class AgentService {
    registry;
    ideDetection;
    eventBus;
    constructor(registry, ideDetection, eventBus) {
        this.registry = registry;
        this.ideDetection = ideDetection;
        this.eventBus = eventBus;
    }
    async executeAgent(agentId) {
        const agent = this.registry.getById(agentId);
        if (!agent) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        this.eventBus.emit('agentSelected', agentId);
        console.log(`Agent selected: ${agent.id}`);
        const environment = await this.ideDetection.detectEnvironment();
        let adapterIdToUse = ConfigManager_1.ConfigManager.defaultAdapter;
        let adapter = this.ideDetection.getAdapter(adapterIdToUse);
        if (!adapter || !(await adapter.isAvailable())) {
            console.log(`Adapter ${adapterIdToUse} is not available, falling back to vscode adapter.`);
            adapter = this.ideDetection.getAdapter('vscode');
        }
        if (adapter) {
            console.log(`Integration: ${adapter.constructor.name}\nStatus: Ready`);
            await adapter.sendAgent(agent);
            this.eventBus.emit('agentExecutionRequested', { agentId: agent.id, adapterId: adapter.id });
        }
        else {
            console.log(`Integration: None\nStatus: Not Available`);
            throw new Error('No available IDE adapter to execute the agent.');
        }
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=AgentService.js.map