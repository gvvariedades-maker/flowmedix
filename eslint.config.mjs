import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** ESLint 9 flat config a partir do pacote oficial Next (CommonJS). */
export default [...require('eslint-config-next')];
