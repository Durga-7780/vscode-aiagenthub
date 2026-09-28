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
exports.VsCodeAdapter = void 0;
const vscode = __importStar(require("vscode"));
class VsCodeAdapter {
    id = 'vscode';
    activeAgent = null;
    participant = null;
    async isAvailable() {
        try {
            // Check if Language Model API is present without making a slow backend query
            return typeof vscode.lm !== 'undefined' && typeof vscode.lm.selectChatModels === 'function';
        }
        catch (e) {
            return false;
        }
    }
    async activate(context) {
        console.log('VsCodeAdapter activated');
        const handler = async (request, chatContext, stream, token) => {
            if (!this.activeAgent) {
                stream.markdown('Please select an agent from AI Agent Hub first.');
                return;
            }
            let userPrompt = request.prompt;
            if (!userPrompt || userPrompt.trim() === '') {
                userPrompt = "Please execute your instructions to implement the project based on the requirement document in this workspace. Follow all steps in your instructions carefully.";
            }
            try {
                let targetModel = request.model;
                if (!targetModel) {
                    const models = await vscode.lm.selectChatModels({ vendor: 'copilot' });
                    if (models.length === 0) {
                        stream.markdown('No Copilot models are available. Please make sure GitHub Copilot is installed and active.');
                        return;
                    }
                    targetModel = models[0];
                }
                const messages = [
                    vscode.LanguageModelChatMessage.User(`You are an AI Agent operating under these instructions:\n\n${this.activeAgent.instructions}\n\nIMPORTANT: You are running inside a formal Tool Calling API. DO NOT output plain-text Copilot tool strings like 'to=functions.exec' or 'to=functions.exec_code'. You MUST strictly use the JSON-based LanguageModelChatTool provided in your context.`),
                    vscode.LanguageModelChatMessage.User(userPrompt)
                ];
                let isDone = false;
                while (!isDone) {
                    isDone = true;
                    const availableTools = vscode.lm.tools ? vscode.lm.tools.map(t => ({
                        name: t.name,
                        description: t.description,
                        inputSchema: t.inputSchema
                    })) : [];
                    const chatResponse = await targetModel.sendRequest(messages, {
                        justification: 'AI Agent Hub requires tool access to execute implementation steps.',
                        tools: availableTools
                    }, token);
                    for await (const fragment of chatResponse.stream) {
                        if (fragment instanceof vscode.LanguageModelTextPart) {
                            stream.markdown(fragment.value);
                        }
                        else if (fragment instanceof vscode.LanguageModelToolCallPart) {
                            isDone = false;
                            stream.markdown(`\n\n*Running tool: ${fragment.name}*\n\n`);
                            let toolResultParts = [];
                            try {
                                const toolResult = await vscode.lm.invokeTool(fragment.name, {
                                    input: fragment.input,
                                    toolInvocationToken: request.toolInvocationToken
                                }, token);
                                toolResultParts = toolResult.content || [];
                            }
                            catch (e) {
                                toolResultParts = [new vscode.LanguageModelTextPart(`Error executing tool: ${e.message}`)];
                            }
                            messages.push(vscode.LanguageModelChatMessage.Assistant([fragment]));
                            messages.push(vscode.LanguageModelChatMessage.User([
                                new vscode.LanguageModelToolResultPart(fragment.callId, toolResultParts),
                                new vscode.LanguageModelTextPart("Tool execution completed. Please continue evaluating your next task or provide a final summary.")
                            ]));
                        }
                    }
                }
            }
            catch (error) {
                if (error instanceof vscode.LanguageModelError) {
                    stream.markdown(`AI Response Error: ${error.message}`);
                }
                else {
                    stream.markdown(`An unexpected error occurred: ${error.message}`);
                }
            }
        };
        this.participant = vscode.chat.createChatParticipant('ai-agent-hub.chat', handler);
        if (context) {
            this.participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.svg');
            context.subscriptions.push(this.participant);
        }
    }
    async sendAgent(agent) {
        this.activeAgent = agent;
        console.log(`[VSCode Adapter] Active agent set to: ${agent.name}`);
        // Notify user and let them chat
        vscode.window.showInformationMessage(`${agent.name} is selected. You can now chat with @ai-agent-hub.`);
        try {
            await vscode.commands.executeCommand('workbench.action.chat.open', { query: '@ai-agent-hub ' });
        }
        catch (e) {
            console.error('Failed to open chat: ', e);
        }
    }
    async sendPrompt(prompt) {
        console.log(`[VSCode Adapter] pre-filling prompt: ${prompt}`);
        try {
            await vscode.commands.executeCommand('workbench.action.chat.open', { query: `@ai-agent-hub ${prompt}` });
        }
        catch (e) {
            vscode.window.showInformationMessage(`Could not automatically open chat. Type @ai-agent-hub ${prompt}`);
        }
    }
}
exports.VsCodeAdapter = VsCodeAdapter;
//# sourceMappingURL=VsCodeAdapter.js.map