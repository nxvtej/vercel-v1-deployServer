import { createClient, commandOptions } from 'redis'
import { downloadS3Folder } from './cloudflare'
import path from 'path'
import { buildProject } from './utils';

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
        const id = "iitfhuqok";
        // const id = response.element;

        console.log(`Building ${id}...`)
        // await downloadS3Folder(`ouput/${id}`)
        console.log(path.join(__dirname, `output/${id}`))
        await downloadS3Folder(`output/${id}`, __dirname)
        await buildProject(id)
        console.log("build successfull")

    }
}

main()