// Jest setup file
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder para testes que importam next/cache
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
