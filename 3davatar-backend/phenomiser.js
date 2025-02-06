import { phonemize } from 'phonemize';

const text = 'Hello world!';
const phonemes = phonemize(text);

if (Array.isArray(phonemes)) {
    // Get only the first phoneme for each word
    const simplifiedPhonemes = phonemes.map(phonemeList => phonemeList[0]);
    console.log(simplifiedPhonemes.join(' '));
} else {
    // If phonemes is a single string, print it directly
    console.log(phonemes);
}
