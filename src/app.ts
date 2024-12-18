import { createClient, commandOptions } from 'redis'
import { copyFinalDist, downloadS3Folder } from './cloudflare'
import path from 'path'
import { buildProject } from './utils';
// to get data 
const subscriber = createClient({ url: 'redis://127.0.0.1:6379' });
subscriber.connect();
// to publiush data, cant do both from same client
const publisher = createClient({ url: 'redis://127.0.0.1:6379' });
publisher.connect();
console.log("service is running...")
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

        console.log(`Downloading ${id}...`)
        publisher.hSet("status", id, "bulding...")
        // await downloadS3Folder(`ouput/${id}`)
        console.log(path.join(__dirname, `output/${id}`))
        await downloadS3Folder(`output/${id}`, __dirname)

        console.log(`Building ${id}...`)
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