import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageWsService } from './message-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() wss: Server;

    constructor(
        private readonly messageWsService: MessageWsService,
        private readonly jwtService: JwtService
    ) { }

    async handleConnection(client: Socket) {
        const token = client.handshake.headers.authentication as string;
        console.log({token});

        let payload: JwtPayload;
        try {
            payload = this.jwtService.verify( token );
            await this.messageWsService.registerClient(client, payload.id);
        } catch (error) {
            client.disconnect();
            return;
        }

        console.log(`++Cliente conectado [${client.id}], Clientes conectados: ${this.messageWsService.getConnectedClients()}`);
        this.wss.emit('clients-updated', this.messageWsService.getConnectedClientIds());
    }

    handleDisconnect(client: Socket) {
        this.messageWsService.removeClient(client.id);
        console.log(`--Cliente desconectado [${client.id}], Clientes conectados: ${this.messageWsService.getConnectedClients()}`);
    }

    @SubscribeMessage('message-from-client')
    handleMessageFromClient( client: Socket, payload: NewMessageDto) {
        console.log({ client, payload });

        //* emite unicamente al mismo cliente
        // client.emit('message-from-server', { 
        //     fullName: 'Soy yo',
        //     messsage: payload.message || ''
        // });

        //* emitir a todos, memnos al cliente inicial
        // client.broadcast.emit('message-from-server', { 
        //     fullName: 'Soy yo',
        //     messsage: payload.message || ''
        // });

        // * emitir a todos, incluyendo aeel mismo
        this.wss.emit('message-from-server', { 
            fullName: this.messageWsService.getUSerFullName(client.id),
            message: payload.message || ''
        });
    }
}
