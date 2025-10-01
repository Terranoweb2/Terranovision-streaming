# 🤝 Guide de Contribution

Merci de vouloir contribuer à TerranoVision ! Voici comment vous pouvez aider.

## 🎯 Types de Contributions

- 🐛 **Bug reports** - Signaler des problèmes
- ✨ **Feature requests** - Proposer de nouvelles fonctionnalités
- 📝 **Documentation** - Améliorer la doc
- 💻 **Code** - Corriger bugs ou ajouter features
- 🌍 **Traductions** - Ajouter de nouvelles langues
- 🎨 **Design** - Améliorer l'UI/UX

## 🚀 Workflow de Contribution

### 1. Fork & Clone

```bash
# Fork sur GitHub, puis :
git clone https://github.com/YOUR_USERNAME/terranovision.git
cd terranovision
git remote add upstream https://github.com/original/terranovision.git
```

### 2. Créer une Branche

```bash
# Feature
git checkout -b feature/ma-nouvelle-fonctionnalite

# Bug fix
git checkout -b fix/correction-bug-xyz

# Documentation
git checkout -b docs/amelioration-readme
```

### 3. Développer

```bash
# Installer dépendances
pnpm install

# Générer Prisma
cd packages/database && pnpm run generate

# Lancer en mode dev
pnpm run dev

# Faire vos modifications...
```

### 4. Tester

```bash
# Linter
pnpm run lint

# Type checking
pnpm run type-check

# Tests unitaires
pnpm run test

# Tests E2E
cd apps/web && pnpm run test:e2e

# Build
pnpm run build
```

### 5. Commit

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>(<scope>): <description>

# Exemples
git commit -m "feat(player): add quality selector"
git commit -m "fix(api): resolve CORS issue"
git commit -m "docs(readme): update installation steps"
git commit -m "refactor(channels): optimize query performance"
git commit -m "test(player): add hls.js tests"
```

**Types :**
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (pas de changement code)
- `refactor`: Refactoring
- `test`: Ajout/modification tests
- `chore`: Maintenance, dépendances, config

### 6. Push & Pull Request

```bash
# Push vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
```

**Template PR :**
```markdown
## Description
Brève description des changements

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Checklist
- [ ] Tests passent
- [ ] Lint OK
- [ ] Documentation mise à jour
- [ ] Ajouté tests si nécessaire
- [ ] Vérifié sur mobile (si UI)

## Screenshots
Si applicable, ajouter captures d'écran
```

## 📋 Standards de Code

### TypeScript/JavaScript

```typescript
// ✅ Bon
export async function getChannels(filter: ChannelFilter): Promise<Channel[]> {
  const channels = await prisma.channel.findMany({ where: filter });
  return channels;
}

// ❌ Mauvais
export async function getChannels(filter) {
  let channels = await prisma.channel.findMany({ where: filter });
  return channels;
}
```

- **Types explicites** (pas de `any`)
- **Async/await** plutôt que callbacks
- **Nommage descriptif** (pas de `data`, `info`, `temp`)
- **Fonctions pures** quand possible
- **Commentaires** pour logique complexe

### React Components

```typescript
// ✅ Bon
interface ChannelCardProps {
  channel: Channel;
  onSelect: (id: string) => void;
}

export function ChannelCard({ channel, onSelect }: ChannelCardProps) {
  return (
    <div onClick={() => onSelect(channel.id)}>
      <img src={channel.logo} alt={channel.name} />
      <h3>{channel.name}</h3>
    </div>
  );
}

// ❌ Mauvais
export function ChannelCard(props: any) {
  return <div onClick={() => props.onSelect(props.channel.id)}>...</div>;
}
```

- **Props typées** avec interface
- **Noms de composants** en PascalCase
- **Hooks en début de composant**
- **Accessibilité** (alt, aria, semantic HTML)

### CSS/Tailwind

```tsx
// ✅ Bon - Classes Tailwind sémantiques
<button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg">
  Regarder
</button>

// ❌ Mauvais - Styles inline
<button style={{ backgroundColor: '#CFAE5E', padding: '8px 16px' }}>
  Regarder
</button>
```

### API/Backend

```typescript
// ✅ Bon - Validation, gestion erreurs
@Post('import')
async importPlaylist(@Body() dto: ImportPlaylistDto) {
  try {
    this.validateDto(dto);
    return await this.ingestService.importFromUrl(dto.url);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}

// ❌ Mauvais - Pas de validation
@Post('import')
async importPlaylist(@Body() body: any) {
  return await this.ingestService.importFromUrl(body.url);
}
```

## 🧪 Tests

### Tests Unitaires

```typescript
// apps/web/src/lib/__tests__/utils.test.ts
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });
});
```

### Tests E2E

```typescript
// apps/web/tests/channels.spec.ts
test('should display channels grid', async ({ page }) => {
  await page.goto('/channels');
  await expect(page.locator('[data-testid="channels-grid"]')).toBeVisible();
});
```

## 📝 Documentation

- Commenter code complexe
- Ajouter JSDoc pour fonctions publiques
- Mettre à jour README si changement majeur
- Ajouter exemples dans la doc API

```typescript
/**
 * Parse M3U playlist and extract channel information
 * @param content - Raw M3U file content
 * @returns Array of parsed channels
 * @throws Error if content is invalid
 */
export function parseM3U(content: string): ParsedChannel[] {
  // Implementation
}
```

## 🚫 Ce qu'il ne faut PAS faire

- ❌ Committer des secrets (tokens, passwords)
- ❌ Committer `node_modules`, `.env`, builds
- ❌ Modifier `.gitignore` sans justification
- ❌ Pousser directement sur `main`
- ❌ Ignorer les erreurs ESLint/TypeScript
- ❌ Code non testé pour features importantes
- ❌ Breaking changes sans discussion

## 🎨 Design System

Utiliser les couleurs du thème :

```typescript
// tailwind.config.ts
colors: {
  primary: '#CFAE5E',    // Or
  secondary: '#0B1E3A',  // Bleu profond
}
```

Respecter l'accessibilité :
- Contraste minimum 4.5:1
- Taille de texte minimum 16px
- Focus visible sur interactions clavier
- Alt text pour images

## 🌍 Internationalisation

```typescript
// TODO: Implémenter i18n
// Structure à venir pour ajouter langues
```

## 📊 Performance

- Optimiser images (WebP, lazy loading)
- Code splitting (dynamic imports)
- Éviter re-renders inutiles (memo, useMemo)
- Surveiller bundle size

## 🔒 Sécurité

- Valider toutes les entrées utilisateur
- Sanitizer HTML/SQL
- Rate limiting sur endpoints sensibles
- HTTPS en production
- Pas de secrets en clair

## 💬 Communication

- Être respectueux et constructif
- Expliquer clairement vos choix
- Répondre aux reviews
- Demander de l'aide si bloqué

## ✅ Checklist PR

Avant de soumettre :

- [ ] Code compilé sans erreurs
- [ ] Tests passent
- [ ] Lint OK
- [ ] Documentation à jour
- [ ] Commits suivent convention
- [ ] Testé localement
- [ ] Pas de secrets commités
- [ ] Screenshots si changement UI

## 🏆 Recognition

Les contributeurs seront ajoutés à [CONTRIBUTORS.md](CONTRIBUTORS.md) !

## 📞 Questions ?

- 💬 Discord : [TerranoVision Dev](https://discord.gg/terranovision-dev)
- 📧 Email : dev@terranovision.com
- 📝 GitHub Discussions

---

**Merci de contribuer à TerranoVision ! 🙏**
