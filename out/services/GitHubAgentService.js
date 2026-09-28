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
exports.GitHubAgentService = void 0;
const vscode = __importStar(require("vscode"));
const https = __importStar(require("https"));
class GitHubAgentService {
    async fetchAgents() {
        const sourceUrl = vscode.workspace.getConfiguration('aiAgentHub').get('githubSource', 'https://raw.githubusercontent.com/example/agents/main/agents.json');
        return new Promise((resolve, reject) => {
            https.get(sourceUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsed = JSON.parse(data);
                            // handle if the json is an array or wrapping object
                            if (Array.isArray(parsed)) {
                                resolve(parsed);
                            }
                            else if (parsed.agents && Array.isArray(parsed.agents)) {
                                resolve(parsed.agents);
                            }
                            else {
                                resolve([]);
                            }
                        }
                        catch (err) {
                            reject(new Error(`Failed to parse agents from GitHub: ${err.message}`));
                        }
                    }
                    else {
                        reject(new Error(`GitHub returned status code ${res.statusCode}`));
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }
}
exports.GitHubAgentService = GitHubAgentService;
//# sourceMappingURL=GitHubAgentService.js.map