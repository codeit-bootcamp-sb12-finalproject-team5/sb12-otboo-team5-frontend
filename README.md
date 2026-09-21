# React + TypeScript + Vite

## 아웃핏

- `/#/outfits`: OOTD 기본 탭과 목록 응답의 `category`별 탭을 표시합니다. 선택한 탭은 `category` 쿼리에 저장됩니다.
- `GET /api/outfit`: `hasNext`가 참이면 `nextCursor`를 다음 요청의 `cursor`로 전달해 전체 카테고리를 구성합니다.
- 카드를 클릭하면 `GET /api/outfit/{outfitId}`를 조회해 상세 모달을 표시합니다.
- `/#/outfits/new`: 추후 제작 기능을 연결할 준비 페이지입니다.

의류의 `imageUrl`에는 브라우저에서 접근 가능한 URL이 필요합니다. 비공개 S3 객체는 기존 의류·피드 API와 동일하게 백엔드에서 서명 URL로 변환해야 합니다. 공개 이미지 서버에서 상대 경로를 제공하는 경우 `.env.local`의 `VITE_IMAGE_BASE_URL`에 해당 서버의 기본 주소를 설정할 수 있습니다. 설정하지 않은 상대 경로는 현재 사이트의 루트 경로를 기준으로 처리합니다.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

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

export default tseslint.config([
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
