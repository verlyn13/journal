// Mock for monaco-editor in test environment

export default {};

export const editor = {
  create: () => ({
    dispose: () => {},
    getValue: () => '',
    setValue: () => {},
    onDidChangeModelContent: () => ({ dispose: () => {} }),
  }),
  setTheme: () => {},
};

export const languages = {
  typescript: {
    typescriptDefaults: {
      setCompilerOptions: () => {},
    },
  },
};
