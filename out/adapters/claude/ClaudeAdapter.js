"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeAdapter = void 0;
class ClaudeAdapter {
    id = 'claude';
    async isAvailable() {
        // Phase 1: Not fully configured, assuming not available by default
        return false;
    }
    async activate() {
        console.log('ClaudeAdapter activated');
    }
    async sendAgent(agent) {
        console.log(`[Claude Adapter] Unsupported or Not Configured.`);
    }
    async sendPrompt(prompt) {
        console.log(`[Claude Adapter] Mock sendPrompt.`);
    }
}
exports.ClaudeAdapter = ClaudeAdapter;
//# sourceMappingURL=ClaudeAdapter.js.map