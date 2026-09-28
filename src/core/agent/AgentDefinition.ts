export interface AgentDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    instructions?: string;
    skillFile?: string;
    tools?: string[];
    capabilities?: string[];
    supportedAdapters?: string[];
    metadata?: Record<string, unknown>;
    category?: string;
    executable?: boolean;
<<<<<<< HEAD
=======
    inputDescription?: string;
    outputDescription?: string;
>>>>>>> origin/ui-changes
}
