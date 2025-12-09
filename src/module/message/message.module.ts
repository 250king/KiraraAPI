import { Module } from '@nestjs/common';
import { MessageService } from '@/module/message/message.service';

@Module({
    providers: [MessageService],
})
export class MessageModule {}
