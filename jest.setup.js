// Jest setup file
// Add any global test setup here

// Polyfill TextEncoder/TextDecoder para testes que importam next/cache
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
