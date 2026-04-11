/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_BOX_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
