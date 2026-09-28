"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdeDetectionService = void 0;
const VsCodeAdapter_1 = require("../adapters/vscode/VsCodeAdapter");
const CursorAdapter_1 = require("../adapters/cursor/CursorAdapter");
const ClaudeAdapter_1 = require("../adapters/claude/ClaudeAdapter");
class IdeDetectionService {
    adapters;
    constructor() {
        this.adapters = [
            new VsCodeAdapter_1.VsCodeAdapter(),
            new CursorAdapter_1.CursorAdapter(),
            new ClaudeAdapter_1.ClaudeAdapter()
        ];
    }
    async detectEnvironment() {
        const integrations = [];
        let currentIde = 'vscode'; // Default to vscode if running in the extension host
        for (const adapter of this.adapters) {
            const isAvailable = await adapter.isAvailable();
            integrations.push({
                id: adapter.id,
                available: isAvailable
            });
            if (isAvailable && adapter.id !== 'vscode') {
                currentIde = adapter.id;
            }
        }
        return {
            ide: currentIde,
            integrations
        };
    }
    getAdapter(id) {
        return this.adapters.find(a => a.id === id);
    }
    getAdapters() {
        return this.adapters;
    }
}
exports.IdeDetectionService = IdeDetectionService;
//# sourceMappingURL=IdeDetectionService.js.map