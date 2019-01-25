# ner-promise
A node.js wrapper for Stanford Named Entity Recognition, using promises.

ner-promises takes text as input and uses Stanford's NER (Java-based) to tag named entities in the text.

This is an adaption of https://github.com/26medias/node-ner using promises.  Another important distinction is that this package takes its input from a variable, rather than needing to read a file.

## Installation:

You will need to download Stanford NER:

https://nlp.stanford.edu/software/stanford-ner-2018-10-16.zip

Please ensure you have the Java Runtime Environment installed and Java in your PATH.

You can test the above by running:

```
java -mx1500m -cp stanford-ner.jar edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier classifiers\english.all.3class.distsim.crf.ser.gz -textFile path-to-a-text-file.txt
```

## NPM Package Installation:

```
npm install ner-promise
```

## Example usage:

```
const ner = require('ner-promise');

const nerPromise = new ner({
	install_path: '/path/to/stanford-ner'  
});

const text = `Bob Moog (1934-2005) was an innovator in the world of electronic music for more than 50 years, expanding the boundaries of sonic expression and affecting the lives of musicians and music lovers around the globe. His invention of the Moog synthesizer in 1964 (in collaboration with Herb Deutsch) revolutionized almost every genre of music, offering performers new sonic possibilities in which to express their creativity. For many musicians, the synthesizer transformed their lives and work.  Bob's impact and the legacy are ongoing.`;

async function test(text){
    const entities = await nerPromise.process(text);
    console.log(entities);
}

test(text);
```

Have fun.
