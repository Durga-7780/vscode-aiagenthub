import { AgentDefinition } from '../core/agent/AgentDefinition';
import { ConfigManager } from '../core/config/ConfigManager';
import * as vscode from 'vscode';
import * as https from 'https';

export class GitHubAgentService {
    public async fetchAgents(): Promise<AgentDefinition[]> {
        const sourceUrl = vscode.workspace.getConfiguration('aiAgentHub').get<string>('githubSource', 'https://raw.githubusercontent.com/example/agents/main/agents.json');
        
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
                            } else if (parsed.agents && Array.isArray(parsed.agents)) {
                                resolve(parsed.agents);
                            } else {
                                resolve([]);
                            }
                        } catch (err: any) {
                            reject(new Error(`Failed to parse agents from GitHub: ${err.message}`));
                        }
                    } else {
                        reject(new Error(`GitHub returned status code ${res.statusCode}`));
                    }
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }
}
