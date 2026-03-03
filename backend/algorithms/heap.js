const crypto = require('crypto');
const { getCharset, getLengthFromComplexity } = require('../utils/charsets');

/**
 * MinHeap implementation for character selection
 */
class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        while (true) {
            let minIndex = index;
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;

            if (leftChild < this.heap.length && this.compare(this.heap[leftChild], this.heap[minIndex]) < 0) {
                minIndex = leftChild;
            }
            if (rightChild < this.heap.length && this.compare(this.heap[rightChild], this.heap[minIndex]) < 0) {
                minIndex = rightChild;
            }
            if (minIndex === index) break;

            [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
            index = minIndex;
        }
    }

    compare(a, b) {
        // Compare by frequency first, then by hash value
        if (a.freq !== b.freq) return a.freq - b.freq;
        return a.hash - b.hash;
    }

    copy() {
        const newHeap = new MinHeap();
        newHeap.heap = [...this.heap];
        return newHeap;
    }

    get length() {
        return this.heap.length;
    }
}


function generate(context) {
    const {
        user_id = '',
        issue_date = '',
        purpose = 'AUTHENTICATION',
        role = 'USER',
        charset = 'ALPHANUM',
        complexity = 'M'
    } = context;

    // Ensure all values are strings (not undefined)
    const safeUserId = String(user_id || '');
    const safeIssueDate = String(issue_date || '');
    const safePurpose = String(purpose || 'AUTHENTICATION');
    const safeRole = String(role || 'USER');

    // Get charset and length
    const charsetStr = getCharset(charset);
    const length = getLengthFromComplexity(complexity);

    // Combine all input fields
    const combinedInput = `${safeUserId}${safePurpose}${safeRole}${safeIssueDate}`;

    // Filter to valid charset characters
    const filtered = combinedInput
        .split('')
        .map(c => c.toUpperCase())
        .filter(c => charsetStr.includes(c))
        .join('');

    if (!filtered) {
        // Fallback to hash if no valid chars
        const hashDigest = crypto.createHash('sha256').update(combinedInput).digest();
        let token = '';
        for (let i = 0; i < length; i++) {
            token += charsetStr[hashDigest[i] % charsetStr.length];
        }
        return token;
    }

    // Calculate character frequencies
    const freqCounter = {};
    for (const char of filtered) {
        freqCounter[char] = (freqCounter[char] || 0) + 1;
    }

    // Build a heap with (frequency, hash_value, character) tuples
    const heap = new MinHeap();
    for (const [char, freq] of Object.entries(freqCounter)) {
        if (charsetStr.includes(char)) {
            const hashVal = parseInt(
                crypto.createHash('md5').update(`${char}${safeUserId}`).digest('hex').substring(0, 8),
                16
            );
            heap.push({ freq, hash: hashVal, char });
        }
    }

    // Build token by popping from heap and cycling
    const tokenChars = [];
    let tempHeap = heap.copy();

    for (let i = 0; i < length; i++) {
        if (tempHeap.length === 0) {
            // Refill heap if exhausted
            tempHeap = heap.copy();
        }

        if (tempHeap.length > 0) {
            const item = tempHeap.pop();
            tokenChars.push(item.char);
        } else {
            // Ultimate fallback
            tokenChars.push(charsetStr[i % charsetStr.length]);
        }
    }

    return tokenChars.join('');
}

const description = "Smart character selection based on input patterns";

module.exports = { generate, description };
