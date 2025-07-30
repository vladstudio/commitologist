# Commitologist Monorepo Migration Plan

## Overview
Transform the current VSCode extension into a monorepo structure supporting both VSCode extension and CLI utility with shared core functionality.

## Target Structure
```
commitologist/
├── packages/
│   ├── core/              # @commitologist/core - Shared business logic
│   ├── vscode/            # @commitologist/vscode - VSCode extension
│   └── cli/               # @commitologist/cli - CLI utility
├── package.json           # Bun workspace configuration
├── biome.json            # Shared formatting rules
├── tsconfig.json         # Base TypeScript configuration
├── CLAUDE.md             # Updated project documentation
└── docs/                 # Shared documentation
```

## Phase 1: Setup Monorepo Infrastructure

### 1.1 Create Package Structure
```bash
mkdir -p packages/{core,vscode,cli}
```

### 1.2 Configure Root Package.json
- Set up Bun workspaces: `"workspaces": ["packages/*"]`
- Define shared scripts for building all packages
- Move shared devDependencies to root
- Version management strategy

### 1.3 Base TypeScript Configuration
- Create root `tsconfig.json` with shared settings
- Package-specific `tsconfig.json` files extending base
- Configure path mapping for internal packages

### 1.4 Shared Tooling
- Move `biome.json` to root for consistent formatting
- Update workspace scripts for linting/formatting all packages

## Phase 2: Extract Core Package

### 2.1 Core Package Structure
```
packages/core/
├── src/
│   ├── AIProvider.ts         # Base AI provider interface
│   ├── ConfigManager.ts      # Configuration management
│   ├── GitAnalyzer.ts        # Git operations
│   ├── MessageGenerator.ts   # Message orchestration
│   ├── PromptManager.ts      # Prompt templates
│   ├── ProviderUtils.ts      # Provider utilities
│   ├── types.ts             # Shared type definitions
│   ├── providers/           # AI provider implementations
│   │   ├── index.ts         # Provider factory
│   │   ├── openai.ts        # OpenAI provider
│   │   ├── anthropic.ts     # Anthropic provider
│   │   ├── gemini.ts        # Google Gemini provider
│   │   ├── openrouter.ts    # OpenRouter provider
│   │   └── ollama.ts        # Ollama provider
│   └── index.ts            # Core package exports
├── package.json            # Core package configuration
└── tsconfig.json          # Core TypeScript config
```

### 2.2 Core Package Configuration
- **Name**: `@commitologist/core`
- **Main**: `dist/index.js`
- **Types**: `dist/index.d.ts`
- **Dependencies**: Minimal (only what core logic needs)
- **Build**: TypeScript compilation to CommonJS for broad compatibility

### 2.3 Abstract VSCode Dependencies
- Remove all `vscode` imports from core files
- Create abstract interfaces for platform-specific functionality
- Ensure ConfigManager works with both VSCode settings and filesystem

## Phase 3: Create VSCode Package

### 3.1 VSCode Package Structure
```
packages/vscode/
├── src/
│   ├── extension.ts        # VSCode extension entry point
│   ├── ConfigAdapter.ts    # VSCode settings adapter
│   └── UIHelpers.ts       # VSCode UI utilities
├── package.json           # VSCode extension manifest
├── tsconfig.json         # VSCode TypeScript config
├── icon.svg              # Extension icons
├── icon-dark.svg
└── logo.png
```

### 3.2 VSCode Package Configuration
- **Name**: `commitologist` (keep existing name for marketplace)
- **Main**: `dist/extension.js`
- **Dependencies**: `@commitologist/core`, `vscode` types
- **Extension Manifest**: Move VSCode-specific configuration from root

### 3.3 Integration Layer
- Create `ConfigAdapter` to bridge VSCode settings with core ConfigManager
- Implement VSCode UI helpers for progress, notifications, git integration
- Wire extension commands to core functionality

## Phase 4: Create CLI Package

### 4.1 CLI Package Structure
```
packages/cli/
├── src/
│   ├── cli.ts             # CLI entry point
│   ├── ConfigAdapter.ts   # Filesystem config adapter
│   └── utils.ts           # CLI utility functions
├── package.json          # CLI package configuration
└── tsconfig.json        # CLI TypeScript config
```

### 4.2 CLI Package Configuration
- **Name**: `@commitologist/cli`
- **Bin**: `{"commitologist": "dist/cli.js"}`
- **Dependencies**: `@commitologist/core`, minimal CLI utilities
- **Build**: Single executable with proper shebang

### 4.3 CLI Feature Implementation
- **Single Purpose**: Generate commit message and output to stdout
- **Non-Interactive**: Uses existing configuration from `~/.commitologist/config.json`
- **Simple Usage**: `commitologist` (no subcommands needed)
- **Configuration**: 
  - Reads from filesystem config (shared with any future interactive tools)
  - Falls back to sensible defaults if no config exists
  - Config management done separately (manual file editing or future config tool)
- **Output**: Plain commit message text to stdout only
- **Error Handling**: Exit codes and stderr for errors

## Phase 5: Migration and Testing

### 5.1 File Migration
1. Move core files to `packages/core/src/`
2. Move VSCode-specific files to `packages/vscode/src/`
3. Update all import paths to use package references
4. Create package-specific build configurations

### 5.2 Dependency Management
- Move shared dependencies to root `package.json`
- Package-specific dependencies in respective `package.json` files
- Ensure no circular dependencies between packages

### 5.3 Build System
- Configure TypeScript project references
- Set up build order: core → vscode/cli
- Test build process for all packages

### 5.4 Testing Strategy
- **Core Package**: Unit tests for business logic
- **VSCode Package**: Extension testing with VSCode test runner
- **CLI Package**: Simple integration tests (stdin/stdout, exit codes, config reading)
- **Cross-Package**: End-to-end workflow testing

## Phase 6: Documentation and Release

### 6.1 Update Documentation
- Update `CLAUDE.md` with monorepo structure
- Create package-specific README files
- Document CLI usage and installation
- Update VSCode extension documentation

### 6.2 Release Strategy
- **Core Package**: Semantic versioning, npm registry
- **VSCode Extension**: Keep existing marketplace presence
- **CLI Package**: npm registry with global installation
- **Coordinated Releases**: Version alignment across packages

### 6.3 CI/CD Updates
- Update build pipelines for monorepo structure
- Package-specific release workflows
- Cross-package testing automation

## Implementation Steps

### Step 1: Preparation
- [ ] Create backup branch
- [ ] Set up monorepo structure
- [ ] Configure workspace tooling

### Step 2: Core Extraction
- [ ] Move shared files to core package
- [ ] Remove VSCode dependencies from core
- [ ] Create core package configuration
- [ ] Test core package builds

### Step 3: VSCode Adaptation  
- [ ] Create VSCode package structure
- [ ] Implement configuration adapter
- [ ] Update extension to use core package
- [ ] Test VSCode extension functionality

### Step 4: CLI Implementation
- [ ] Create CLI package structure
- [ ] Implement simple CLI entry point (stdout only)
- [ ] Create filesystem configuration adapter
- [ ] Test CLI functionality

### Step 5: Integration Testing
- [ ] Test all packages build correctly
- [ ] Verify functionality in both VSCode and CLI
- [ ] Run comprehensive test suite

### Step 6: Documentation and Release
- [ ] Update all documentation
- [ ] Prepare release packages
- [ ] Deploy to respective registries

## Risk Mitigation

### Potential Issues
1. **Import Path Updates**: Many files will need import path changes
2. **VSCode Extension Breaking**: Extension marketplace continuity
3. **Configuration Compatibility**: Existing user settings
4. **Build Complexity**: Multiple package coordination

### Mitigation Strategies
1. **Gradual Migration**: Complete one package at a time
2. **Backward Compatibility**: Maintain existing configuration paths
3. **Extensive Testing**: Test both packages thoroughly before release
4. **Rollback Plan**: Keep current structure in separate branch

## Success Criteria
- [ ] VSCode extension maintains all current functionality
- [ ] CLI utility provides equivalent functionality
- [ ] Core package is reusable and well-documented
- [ ] Build and release processes work smoothly
- [ ] No breaking changes for existing users
- [ ] Both packages can be developed and released independently

## Timeline Estimate
- **Phase 1-2**: 1-2 days (setup and core extraction)
- **Phase 3**: 1 day (VSCode adaptation)
- **Phase 4**: 1-2 days (CLI implementation)
- **Phase 5**: 1-2 days (testing and integration)
- **Phase 6**: 1 day (documentation and release)

**Total**: 5-8 days of focused development work