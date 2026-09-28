"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorAdapter = void 0;
class CursorAdapter {
    id = 'cursor';
    async isAvailable() {
        // Phase 1: Not fully configured, detecting by environment variables or command availability
        const isCursorEnvironment = process.env.CURSOR_APP === 'true' || false;
        return isCursorEnvironment;
    }
    async activate() {
        console.log('CursorAdapter activated');
    }
    async sendAgent(agent) {
        console.log(`[Cursor Adapter] Not currently supported via formal API. Status: MOCK.`);
    }
    async sendPrompt(prompt) {
        console.log(`[Cursor Adapter] Mock sendPrompt.`);
    }
}
exports.CursorAdapter = CursorAdapter;
//# sourceMappingURL=CursorAdapter.js.map