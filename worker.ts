import "reflect-metadata"
import { parentPort } from "worker_threads";
import { IncommingMsg } from "./lib/network";
import {AppDataSource} from './db/datasource';
import { loginHandler } from "./lib/worker/auth";
import { Receipt } from "./lib/interfaces";
import { delAI, hasMap, joinGameHandler, killEngine, leaveGame, midJoin, setAI, setMap, setMod, setSpec, setTeam, startGame } from "./lib/worker/dod";


const handlersTable: {
    [index: string]: 
    (params: {
        username?: string,
        password?: string,
        gameName?: string
        player?: string
        team?: string
        mapId?: number
        mod?: string
        [key:string]: any
    }, seq: number, caller: string) => Promise<Receipt>
} = 
{ 
        LOGIN: loginHandler,
        JOINGAME: joinGameHandler,
        SETTEAM: setTeam,
        SETMAP: setMap,
        STARTGAME: startGame,
        SETSPEC: setSpec,
        LEAVEGAME: leaveGame,
        HASMAP: hasMap,
        MIDJOIN: midJoin,
        KILLENGINE: killEngine,
        SETMOD: setMod,
        SETAI: setAI,
        DELAI: delAI
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

    const receipt = await hanlder(msg.parameters, msg.seq, msg.caller);

    toParent(receipt);
})
