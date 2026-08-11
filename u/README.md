# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Docker image

The production SPA is published as `ghcr.io/soundinfluencers/client` by the
manual **Build and publish container** GitHub Actions workflow. Run the workflow
with a `source_ref` from the `main` branch. The only enabled release channel is
`main`, which publishes `main-<7-character-commit-sha>`.

The immutable SHA tag is the deployment reference. Mutable branch aliases may
also be published, but `latest` is not used.

The image listens on port `8080` and exposes `GET /health`. It serves the Vite
SPA through unprivileged nginx with history fallback. The public backend URL is
required at container startup through `PUBLIC_API_URL`; it is not a Docker build
argument. Container publication is currently enabled only for `main`.

Build and verify the image locally from the repository root:

```bash
docker build -t soundinfluencers-client:test .

docker run --rm -d \
  --name soundinfluencers-client-test \
  -p 127.0.0.1:18080:8080 \
  -e PUBLIC_API_URL=https://dev-api.soundinfluencers.com \
  soundinfluencers-client:test

curl --fail http://127.0.0.1:18080/health
curl --fail http://127.0.0.1:18080/deployment-smoke-route
curl --fail http://127.0.0.1:18080/runtime-config.js

docker stop soundinfluencers-client-test
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
