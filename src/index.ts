import { EntityRecognizer } from './NerPromise'

export { EntityRecognizer }

const installPath = 'tmp/stanford-ner-2020-11-17'
const ner = new EntityRecognizer({ installPath })

const text = `WASHINGTON — President Biden signed a $1 trillion infrastructure bill into law on Monday afternoon, a bipartisan victory that will pour billions into the nation’s roads, ports and power lines.

While the bill stopped short of realizing his full-scale ambitions for overhauling America’s transportation and energy systems, Mr. Biden pointed to it as evidence that lawmakers could work across party lines to solve problems in Washington.

He also said it would better position the United States to compete against China and other nations vying for dominance of 21st century emerging industries.

Hours before a virtual summit with President Xi Jinping of China, whose infrastructure initiatives have helped vault China to global leadership in advanced manufacturing and other areas, Mr. Biden said the bill showed democratic governments can deliver for their citizens.`

const run = async () => {
    const entities = await ner.process(text)

    console.log(entities)
}

run()
