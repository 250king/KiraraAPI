import { Body, Controller, Delete, HttpCode, Post } from '@nestjs/common';
import { SessionService } from '@/module/session/session.service';
import { User } from '@/module/common/user.decorator';
import { SessionDto } from '@/module/session/session.dto';
import { HttpStatusCode } from 'axios';
import type { UserEntity } from '@/module/common/user.entity';

@Controller('/session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) {}

    @Post()
    createSession(@Body() data: SessionDto, @User() user: UserEntity) {
        return this.sessionService.createSession(data, user);
    }

    @Delete()
    @HttpCode(HttpStatusCode.NoContent)
    revokeSession(@User() user: UserEntity) {
        return this.sessionService.revokeSession(user);
    }
}
