import { IdeAdapter } from '../adapters/IdeAdapter';
import { VsCodeAdapter } from '../adapters/vscode/VsCodeAdapter';
import { CursorAdapter } from '../adapters/cursor/CursorAdapter';
import { ClaudeAdapter } from '../adapters/claude/ClaudeAdapter';

export interface IntegrationStatus {
    id: string;
    available: boolean;
}

export interface IdeEnvironment {
    ide: string;
    integrations: IntegrationStatus[];
}

export class IdeDetectionService {
    private adapters: IdeAdapter[];

    constructor() {
        this.adapters = [
            new VsCodeAdapter(),
            new CursorAdapter(),
            new ClaudeAdapter()
        ];
    }

    async detectEnvironment(): Promise<IdeEnvironment> {
        const integrations: IntegrationStatus[] = [];

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

    getAdapter(id: string): IdeAdapter | undefined {
         return this.adapters.find(a => a.id === id);
    }

    getAdapters(): IdeAdapter[] {
        return this.adapters;
    }
}
