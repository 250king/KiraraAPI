import { Module } from '@nestjs/common';
import { GroupService } from '@/module/group/group.service';
import { SessionService } from '@/module/session/session.service';
import { EndpointService } from '@/module/endpoint/endpoint.service';
import { SessionController } from '@/module/session/session.controller';
import { XrayService } from '@/module/xray/xray.service';
import { MessageService } from '@/module/message/message.service';

@Module({
    controllers: [SessionController],
    providers: [SessionService, EndpointService, GroupService, XrayService, MessageService],
})
export class SessionModule {}
