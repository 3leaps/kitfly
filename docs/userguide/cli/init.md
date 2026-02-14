# kitfly init

Create new project from template.

## Usage

```bash
kitfly init [name] [options]
```

## Description

Initializes a new kitfly project with all necessary files and folder structure. Creates a standalone site that you own and can customize.

## Arguments

| Argument | Description                                         |
| -------- | --------------------------------------------------- |
| `name`   | Project directory name (default: current directory) |

## Options

| Option              | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `--template <name>` | Template to use: `minimal`, `handbook`, `runbook` (default: minimal) |
| `--standalone`      | Create self-contained site with rendering code (default: true)       |
| `--brand <name>`    | Set brand name                                                       |
| `--brand-url <url>` | Set brand URL                                                        |

## Templates

### minimal

Basic documentation site with simple structure:

- Single content section
- Clean starting point
- Minimal example content

### handbook

Team/company handbook template:

- Multiple sections (About, Policies, Guides, Resources)
- Onboarding-focused structure
- Sample policies and guides

### runbook

Operations runbook template:

- Procedures, Troubleshooting, Reference, Incidents sections
- Operations-focused structure
- Incident response templates

## Examples

### Basic usage

```bash
# Create in new directory
kitfly init my-docs

# Create in current directory
kitfly init .

# Use handbook template
kitfly init company-handbook --template handbook
```

### With branding

```bash
kitfly init my-docs --brand "Acme Corp" --brand-url "https://acme.com"
```

## Output Structure

```
my-docs/
├── content/
│   └── index.md
├── scripts/
│   ├── dev.ts
│   ├── build.ts
│   └── bundle.ts
├── src/
│   └── ...
├── site.yaml
├── theme.yaml
├── package.json
└── README.md
```

## After Initialization

```bash
cd my-docs
bun install
bun run dev
```

## Standalone Mode

By default, `kitfly init` creates a standalone site with its own copy of:

- Rendering scripts (dev, build, bundle)
- Engine and theme code
- Configuration schemas

This means your site is independent - no kitfly CLI required after setup.

## See Also

- [kitfly update](update.md) - Update site code
- [kitfly dev](dev.md) - Start development
