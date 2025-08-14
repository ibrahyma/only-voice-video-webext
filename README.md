# Only Voice Video WebExtension
## Description

**Only Voice Video** est une extension destinée à filtrer le son d'une vidéo pour ne conserver que les paroles.<br>
Elle est développée en **TypeScript** et utilise **Vite** pour le build.

<hr/>

## Prérequis

Avant de compiler l’extension, vous devez installer :

- Node.js ≥ 18.x
- npm ≥ 9.x
- TypeScript ≥ 5.x (installé via npm)
- Vite ≥ 6.x (installé via npm)
- Terminal ou shell compatible (Windows, macOS, Linux)

Toutes les dépendances sont listées dans `package.json` et s’installent via `npm install`.

<hr/>

## Installation des dépendances

Depuis la racine du projet, exécuter :

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires.

<hr/>

## Compilation du projet

L’extension contient des fichiers TypeScript, HTML et CSS dans le dossier src/.
Le build final se fait en deux étapes :

1. Compilation TypeScript
```bash
npm run build
```
Cette commande exécute `tsc` et génère les fichiers JavaScript correspondants.

2. Build Vite
```bash
npm run build-watch
```
Cette commande :

- Transpile tous les fichiers `.ts` de `src/` vers `.js`
- Copie tous les fichiers HTML et CSS vers le dossier `build/`
- Conserve la structure des fichiers source (non minifiés)
- Génère des chunks pour les modules séparés dans `chunks/`

Le dossier final `build/` contient tous les fichiers nécessaires pour soumettre l’extension à Firefox Add-ons.

<hr/>

## Vérification locale

Pour tester l’extension dans Firefox :

1. Ouvrir `about:debugging#/runtime/this-firefox`
2. Cliquer sur **Charger un module complémentaire temporaire**
3. Sélectionner `manifest.json`
