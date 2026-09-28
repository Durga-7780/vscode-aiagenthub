"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AgentLoader {
    registry;
    constructor(registry) {
        this.registry = registry;
    }
    async loadFromDirectory(directory) {
        try {
            await fs.promises.access(directory);
        }
        catch {
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
                        const agentDef = JSON.parse(content);
                        if (agentDef.skillFile) {
                            const skillPath = path.join(directory, entry.name, agentDef.skillFile);
                            agentDef.instructions = await fs.promises.readFile(skillPath, 'utf8');
                        }
                        this.validate(agentDef);
                        this.registry.register(agentDef);
                        console.log(`Loaded agent: ${agentDef.id}`);
                    }
                    catch (error) {
                        if (error.code !== 'ENOENT') {
                            console.error(`Failed to load agent from ${agentJsonPath}:`, error);
                        }
                    }
                }
            });
            await Promise.all(loadPromises);
        }
        catch (error) {
            console.error(`Error reading agents directory: ${directory}`, error);
        }
    }
    validate(agent) {
        if (!agent.id || !agent.name || !agent.version || (!agent.instructions && !agent.skillFile)) {
            throw new Error(`Invalid agent definition missing required fields`);
        }
    }
}
exports.AgentLoader = AgentLoader;
//# sourceMappingURL=AgentLoader.js.map