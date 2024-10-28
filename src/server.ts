import { createClient, commandOptions } from 'redis'
import { downloadS3Folder } from './cloudflare'

const subscriber = createClient();
subscriber.connect();


async function main() {
    while (1) {
        const response = await subscriber.brPop(
            commandOptions({ isolated: true }),
            'build-id',
            0
        )

        if (response) {
            console.log(typeof response)
            console.log(response)
        } else {
            throw new Error("No response")
        }
        const id = response.element;
        console.log(`Building ${id}...`)

        await downloadS3Folder(`/output/${id}`)
    }
}

main()