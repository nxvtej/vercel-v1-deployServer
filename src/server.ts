import { createClient, commandOptions } from 'redis'
import { copyFinalDist, downloadS3Folder } from './cloudflare'
import path from 'path'
import { buildProject } from './utils';

// to get data 
const subscriber = createClient();
subscriber.connect();

// to publiush data, cant do both from same client
const publisher = createClient();
publisher.connect();


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
        // const id = "iitfhuqok";
        const id = response.element;

        console.log(`Building ${id}...`)
        publisher.hSet("status", id, "bulding...")
        // await downloadS3Folder(`ouput/${id}`)
        console.log(path.join(__dirname, `output/${id}`))
        await downloadS3Folder(`output/${id}`, __dirname)
        await buildProject(id)
        console.log("build successfull")
        publisher.hSet("status", id, "build successfull, sending to server...")

        console.log("sending final dist...")
        await copyFinalDist(id)
        console.log("sent to server")
        publisher.hSet("status", id, "deployed")
    }
}

main()