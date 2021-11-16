import map from 'lodash.map'
import _compact from 'lodash.compact'
import path from 'path'
import stream from 'stream'
import { execFile } from 'child_process'

export interface NEROptions {
    installPath: string
    jar?: string
    classifier?: string
}

interface EntityGroup {
    [key: string]: string[]
}

class EntityRecognizer {
    options: NEROptions
    jarFilePath: string
    classifiersPath: string
    constructor(options: NEROptions) {
        this.options = Object.assign(
            {
                installPath: '',
                jar: 'stanford-ner.jar',
                classifier: 'english.all.3class.distsim.crf.ser.gz',
            },
            options,
        )
        this.jarFilePath = path.normalize(
            this.options.installPath + '/' + this.options.jar,
        )
        this.classifiersPath = path.normalize(
            this.options.installPath +
                '/classifiers/' +
                this.options.classifier,
        )
    }

    async processAsync(text: string) {
        if (this.options.installPath === '')
            throw new Error('Please specify the install path to Stanford NER.')
        return new Promise<EntityGroup>((resolve, reject) => {
            this.getNamedEntityGroups(text, true, resolve, reject)
        })
    }

    getNamedEntityGroups(
        text: string,
        async: boolean,
        resolve?: Function,
        reject?: Function,
    ) {
        try {
            const jarFilePath = path.normalize(
                this.options.installPath + '/' + this.options.jar,
            )
            text = text.replace(/\n/g, ' ')
            let proc = execFile(
                'java',
                [
                    '-mx1500m',
                    '-cp',
                    jarFilePath,
                    'edu.stanford.nlp.ie.crf.CRFClassifier',
                    '-loadClassifier',
                    path.normalize(
                        this.options.installPath +
                            '/classifiers/' +
                            this.options.classifier,
                    ),
                    '-readStdin',
                ],
                (err: any, stdout, stderr) => {
                    console.log(stdout)
                    if (err) {
                        if (async) reject(err)
                        throw new Error(err.message)
                    }
                    if (async) resolve(this.parse(stdout))
                    else return this.parse(stdout)
                },
            )

            //modified to use promises and allow data from stdin (stream)
            var stdinStream = new stream.Readable()
            stdinStream.push(text)
            stdinStream.push(null)
            if (proc.stdin) stdinStream.pipe(proc.stdin)
        } catch (err) {
            console.error(`Error: ${err}`)
        }
    }

    //code below is by original dev.
    parse(parsed: string) {
        const tokenized = parsed.split(/\s/gim)

        let tagged = map(tokenized, function (token) {
            var parts = new RegExp('(.+)/([A-Z]+)', 'g').exec(token)
            if (parts) {
                return {
                    w: parts[1],
                    t: parts[2],
                }
            }
            return null
        })

        tagged = _compact(tagged)

        // Now we extract the neighbors into one entity

        var entities = {} as EntityGroup
        var i
        var l = tagged.length
        let prevEntity: string = null
        var entityBuffer = []
        for (i = 0; i < l; i++) {
            if (tagged[i].t != 'O') {
                if (tagged[i].t != prevEntity) {
                    // New tag!
                    // Was there a buffer?
                    if (entityBuffer.length > 0) {
                        // There was! We save the entity
                        if (!entities.hasOwnProperty(prevEntity)) {
                            entities[prevEntity] = []
                        }
                        entities[prevEntity].push(entityBuffer.join(' '))
                        // Now we set the buffer
                        entityBuffer = []
                    }
                    // Push to the buffer
                    entityBuffer.push(tagged[i].w)
                } else {
                    // Prev entity is same a current one. We push to the buffer.
                    entityBuffer.push(tagged[i].w)
                }
            } else {
                if (entityBuffer.length > 0) {
                    // There was! We save the entity
                    if (!entities.hasOwnProperty(prevEntity)) {
                        entities[prevEntity] = []
                    }
                    entities[prevEntity].push(entityBuffer.join(' '))
                    // Now we set the buffer
                    entityBuffer = []
                }
            }
            // Save the current entity
            prevEntity = tagged[i]?.t
        }
        console.log(entities)
        return entities
    }
}

export { EntityRecognizer }
