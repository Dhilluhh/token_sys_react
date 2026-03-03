const hashing = require('../algorithms/hashing');
const folding = require('../algorithms/folding');
const modulo = require('../algorithms/modulo');
const random = require('../algorithms/random');
const compression = require('../algorithms/compression');
const reverse = require('../algorithms/reverse');

describe('Token Generation Algorithms', () => {

    const testContext = {
        user_id: 'alice123',
        issue_date: '2026-01-18 09:30:00',
        purpose: 'AUTHENTICATION',
        role: 'ADMIN',
        validity_days: 30,
        charset: 'ALPHANUM',
        complexity: 'M'
    };

    // Test deterministic algorithms
    describe('Deterministic Algorithms', () => {

        test('hashing: same inputs produce same token', () => {
            const token1 = hashing.generate(testContext);
            const token2 = hashing.generate(testContext);
            expect(token1).toBe(token2);
        });

        test('folding: same inputs produce same token', () => {
            const token1 = folding.generate(testContext);
            const token2 = folding.generate(testContext);
            expect(token1).toBe(token2);
        });

        test('modulo: same inputs produce same token', () => {
            const token1 = modulo.generate(testContext);
            const token2 = modulo.generate(testContext);
            expect(token1).toBe(token2);
        });

        test('compression: same inputs produce same token', () => {
            const token1 = compression.generate(testContext);
            const token2 = compression.generate(testContext);
            expect(token1).toBe(token2);
        });

        test('reverse: same inputs produce same token', () => {
            const token1 = reverse.generate(testContext);
            const token2 = reverse.generate(testContext);
            expect(token1).toBe(token2);
        });
    });

    // Test token length matches complexity
    describe('Token Length', () => {

        test('complexity S produces 4-character tokens', () => {
            const ctx = { ...testContext, complexity: 'S' };
            expect(hashing.generate(ctx)).toHaveLength(4);
            expect(folding.generate(ctx)).toHaveLength(4);
            expect(modulo.generate(ctx)).toHaveLength(4);
            expect(random.generate(ctx)).toHaveLength(4);
            expect(compression.generate(ctx)).toHaveLength(4);
            expect(reverse.generate(ctx)).toHaveLength(4);
        });

        test('complexity M produces 6-character tokens', () => {
            const ctx = { ...testContext, complexity: 'M' };
            expect(hashing.generate(ctx)).toHaveLength(6);
            expect(folding.generate(ctx)).toHaveLength(6);
            expect(modulo.generate(ctx)).toHaveLength(6);
            expect(random.generate(ctx)).toHaveLength(6);
            expect(compression.generate(ctx)).toHaveLength(6);
            expect(reverse.generate(ctx)).toHaveLength(6);
        });

        test('complexity C produces 8-character tokens', () => {
            const ctx = { ...testContext, complexity: 'C' };
            expect(hashing.generate(ctx)).toHaveLength(8);
            expect(folding.generate(ctx)).toHaveLength(8);
            expect(modulo.generate(ctx)).toHaveLength(8);
            expect(random.generate(ctx)).toHaveLength(8);
            expect(compression.generate(ctx)).toHaveLength(8);
            expect(reverse.generate(ctx)).toHaveLength(8);
        });
    });

    // Test charset validation
    describe('Charset Validation', () => {

        const charsets = {
            NUMBER: '0123456789',
            ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            ALPHANUM: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            SPECIAL: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*?'
        };

        Object.entries(charsets).forEach(([charsetName, charsetStr]) => {
            test(`${charsetName}: all characters belong to charset`, () => {
                const ctx = { ...testContext, charset: charsetName };

                const tokens = [
                    hashing.generate(ctx),
                    folding.generate(ctx),
                    modulo.generate(ctx),
                    random.generate(ctx),
                    compression.generate(ctx),
                    reverse.generate(ctx)
                ];

                tokens.forEach(token => {
                    for (const char of token) {
                        expect(charsetStr).toContain(char);
                    }
                });
            });
        });
    });

    // Test random algorithm variability
    describe('Random Algorithm', () => {

        test('produces different tokens on multiple calls', () => {
            const tokens = new Set();

            // Generate 10 tokens
            for (let i = 0; i < 10; i++) {
                tokens.add(random.generate(testContext));
            }

            // Should have at least 8 unique tokens (allowing for rare collisions)
            expect(tokens.size).toBeGreaterThanOrEqual(8);
        });
    });

    // Test algorithm exports
    describe('Algorithm Module Structure', () => {

        const algorithms = [hashing, folding, modulo, random, compression, reverse];

        algorithms.forEach(algo => {
            test(`${algo.description}: has generate function`, () => {
                expect(typeof algo.generate).toBe('function');
            });

            test(`${algo.description}: has description`, () => {
                expect(typeof algo.description).toBe('string');
                expect(algo.description.length).toBeGreaterThan(0);
            });
        });
    });

    // Test edge cases
    describe('Edge Cases', () => {

        test('handles empty strings gracefully', () => {
            const ctx = {
                user_id: 'test',
                purpose: '',
                role: '',
                validity_days: 0,
                charset: 'ALPHANUM',
                complexity: 'M'
            };

            expect(() => hashing.generate(ctx)).not.toThrow();
            expect(() => folding.generate(ctx)).not.toThrow();
            expect(() => modulo.generate(ctx)).not.toThrow();
            expect(() => random.generate(ctx)).not.toThrow();
            expect(() => compression.generate(ctx)).not.toThrow();
            expect(() => reverse.generate(ctx)).not.toThrow();
        });
    });
});
