import * as fs from 'fs';
import * as path from 'path';
import { AgentRegistry } from './AgentRegistry';
import { AgentDefinition } from './AgentDefinition';

export class AgentLoader {
    private registry: AgentRegistry;

    constructor(registry: AgentRegistry) {
        this.registry = registry;
    }

    public async loadFromDirectory(directory: string): Promise<void> {
        try {
            await fs.promises.access(directory);
        } catch {
            console.warn(`Agents directory does not exist: ${directory}`);
            return;
        }

        try {
            const entries = await fs.promises.readdir(directory, { withFileTypes: true });

            const loadPromises = entries.map(async (entry) => {
                if (entry.isDirectory()) {
                    const agentJsonPath = path.join(directory, entry.name, 'agent.json');
                    try {
                        const content = await fs.promises.readFile(agentJsonPath, 'utf8');
                        const agentDef = JSON.parse(content) as AgentDefinition;
                        
                        if (agentDef.skillFile) {
                            const skillPath = path.join(directory, entry.name, agentDef.skillFile);
                            agentDef.instructions = await fs.promises.readFile(skillPath, 'utf8');
                        }

                        this.validate(agentDef);
                        this.registry.register(agentDef);
                        console.log(`Loaded agent: ${agentDef.id}`);
                    } catch (error: any) {
                        if (error.code !== 'ENOENT') {
                            console.error(`Failed to load agent from ${agentJsonPath}:`, error);
                        }
                    }
                }
            });

            await Promise.all(loadPromises);
        } catch (error) {
            console.error(`Error reading agents directory: ${directory}`, error);
        }
    }

    private validate(agent: AgentDefinition): void {
        if (!agent.id || !agent.name || !agent.version || (!agent.instructions && !agent.skillFile)) {
            throw new Error(`Invalid agent definition missing required fields`);
        }
    }
}
