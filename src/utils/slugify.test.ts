import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

// Node 的原生 ESM 解析器要求显式扩展名（tsconfig 已开启
// `allowImportingTsExtensions`，所以 `.ts` 后缀是合法的）。
import { slugify } from './slugify.ts';

describe('slugify', () => {
  test('Latin tags are lowercased', () => {
    assert.equal(slugify('JavaScript'), 'javascript');
  });

  test('Japanese tags are preserved', () => {
    assert.equal(slugify('テスト'), 'テスト');
  });

  test('Malayalam tags are preserved', () => {
    assert.equal(slugify('മലയാളം'), 'മലയാളം');
  });

  test('Chinese tags are preserved', () => {
    assert.equal(slugify('全身控制'), '全身控制');
  });

  test('Mixed strings join with a hyphen', () => {
    assert.equal(slugify('日本語 テスト'), '日本語-テスト');
  });

  test('Multiple spaces become a single hyphen', () => {
    assert.equal(slugify('hello   world'), 'hello-world');
  });

  test('Special characters are removed', () => {
    assert.equal(slugify('hello@world!'), 'helloworld');
  });

  test('Leading and trailing hyphens are trimmed', () => {
    assert.equal(slugify('  hello  '), 'hello');
  });

  test('Mixed Latin and Unicode', () => {
    assert.equal(slugify('React テスト'), 'react-テスト');
  });

  test('Accented characters are preserved', () => {
    assert.equal(slugify('café'), 'café');
  });

  test('Empty string after processing returns empty', () => {
    assert.equal(slugify('!!!'), '');
  });
});
