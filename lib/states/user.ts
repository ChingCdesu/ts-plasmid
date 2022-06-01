
import {User as DBUser} from '../../db/models/user';
import { GameRoom } from './room';
import { ChatRoom } from './chat';


export class User extends DBUser {
    chatRooms: ChatRoom[] = []
    game: GameRoom | null = null;

    constructor(user: DBUser) {
        super();
        this.id = user.id;
        this.username = user.username;
        this.accessLevel = user.accessLevel;
        this.exp = user.exp;
        this.sanity = user.sanity;
        this.blocked = user.blocked;
        // clear sensitive fields
        this.hash = "";
        this.salt = "";
    }

    getState() {
        return {
            id: this.id,
            username: this.username,
            accessLevel: this.accessLevel,
            exp: this.exp,
            sanity: this.sanity,
            blocked: this.blocked
        }
    }

    joinChat(chat: ChatRoom) {
        this.chatRooms.push(chat);
    }

    leaveChat(chat: ChatRoom) {
        this.chatRooms = this.chatRooms.filter(c => c !== chat);
    }

    joinGame(game: GameRoom) {
        this.game = game;
    }

    leaveGame() {
        this.game = null;
    }
}