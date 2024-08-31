import antfu, { imports, node, typescript } from '@antfu/eslint-config';

export default antfu(
    {
        type: 'app',
        stylistic: {
            indent: 4,
            quotes: 'single',
            semi: true,
            braceStyle: '1tbs',
        },
        markdown: false,
        typescript: true,
        ignores: [
            '.github/**',
            '.idea/**',
            '.vscode/**',
            '.wrangler/**',
            'dist/**',
            'node_modules/**',
        ],
    },
    imports,
    typescript,
    node,
    {
        rules: {
            'node/prefer-global/process': 'off',
            'node/prefer-global/buffer': 'off',
            'eslint-comments/no-unlimited-disable': 'off',
            'padding-line-between-statements': 'off',
            'no-console': 'off',
            'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
        },
    },
);
