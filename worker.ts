import "reflect-metadata"
import { parentPort } from "worker_threads";
import { IncommingMsg } from "./lib/network";
import {AppDataSource} from './db/datasource';
import { loginHandler } from "./lib/worker/auth";
import { Receipt } from "./lib/interfaces";


const handlersTable: {
    [index: string]: 
    (params: {
        username?: string,
        password?: string,
        [key:string]: any
    }, seq: number) => Promise<Receipt>
} = 
{ 
        LOGIN: loginHandler
}

let dbInitialized = false;

function toParent(receipt: Receipt) {
    parentPort?.postMessage(receipt)
}

AppDataSource.initialize().then(() => {
    dbInitialized = true;
}).catch(e=> {
    console.log(e)
})

parentPort?.on('message', async (msg: IncommingMsg) => {
    if(!(msg.action in handlersTable)) return;

    const action = msg.action;
    const hanlder = handlersTable[action]

    const receipt = await hanlder(msg.parameters, msg.seq);

    toParent(receipt);
})
