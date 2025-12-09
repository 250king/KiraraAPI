import { Module } from '@nestjs/common';
import { GroupService } from '@/module/group/group.service';

@Module({
    providers: [GroupService],
})
export class GroupModule {}
