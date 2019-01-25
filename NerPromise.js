const _assign = require('lodash.assign');
const _compact = require('lodash.compact')
const _map = require('lodash.map');
const exec = require('child_process').execFile;
const stream = require('stream');
const path = require('path');


class NerPromise {
    constructor(options) {
        this.options = _assign({
            install_path: '',
            jar: 'stanford-ner.jar',
            classifier:	'english.all.3class.distsim.crf.ser.gz'
        }, options);
    }
    //modified to use promises and allow data from stdin (stream)
    async process(text) {
        return new Promise((resolve, reject) => {
            try {
                if(this.options.install_path === '') throw new Error('Please specify the install path to Stanford NER.');

                let self = this;
                text = text.replace(/\n/g, ' ')
                let proc = exec('java', ['-mx1500m',
                    '-cp',
                    path.normalize(this.options.install_path + '/' + this.options.jar),
                    'edu.stanford.nlp.ie.crf.CRFClassifier',
                    '-loadClassifier',
                    path.normalize(this.options.install_path + '/classifiers/' + this.options.classifier),
                    '-readStdin'], function (err, stdout, stderr) {
                        if (err) {
                            reject(err);
                            throw new Error(err)
                        }
                        resolve(self.parse(stdout));
                    });

                var stdinStream = new stream.Readable();
                stdinStream.push(text); 
                stdinStream.push(null);
                stdinStream.pipe(proc.stdin)
            } catch (err) {
                console.error(`Error: ${err}`);
                reject(err)
            }
        });
    }
    //code below is by original dev.
    parse(parsed) {
        var tokenized = parsed.split(/\s/gmi);

        var tagged = _map(tokenized, function (token) {
            var parts = new RegExp('(.+)/([A-Z]+)', 'g').exec(token);
            if (parts) {
                return {
                    w: parts[1],
                    t: parts[2]
                }
            }
            return null;
        });

        tagged = _compact(tagged);

        // Now we extract the neighbors into one entity
        var entities = {};
        var i;
        var l = tagged.length;
        var prevEntity = false;
        var entityBuffer = [];
        for (i = 0; i < l; i++) {
            if (tagged[i].t != 'O') {
                if (tagged[i].t != prevEntity) {
                    // New tag!
                    // Was there a buffer?
                    if (entityBuffer.length > 0) {
                        // There was! We save the entity
                        if (!entities.hasOwnProperty(prevEntity)) {
                            entities[prevEntity] = [];
                        }
                        entities[prevEntity].push(entityBuffer.join(' '));
                        // Now we set the buffer
                        entityBuffer = [];
                    }
                    // Push to the buffer
                    entityBuffer.push(tagged[i].w);
                } else {
                    // Prev entity is same a current one. We push to the buffer.
                    entityBuffer.push(tagged[i].w);
                }
            } else {
                if (entityBuffer.length > 0) {
                    // There was! We save the entity
                    if (!entities.hasOwnProperty(prevEntity)) {
                        entities[prevEntity] = [];
                    }
                    entities[prevEntity].push(entityBuffer.join(' '));
                    // Now we set the buffer
                    entityBuffer = [];
                }
            }
            // Save the current entity
            prevEntity = tagged[i].t;
        }
        return entities;
    }
}
module.exports = NerPromise;