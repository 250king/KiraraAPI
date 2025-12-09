import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@/module/common/user.entity';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
});
