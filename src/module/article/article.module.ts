import { Module } from '@nestjs/common';
import { ArticleController } from '@/module/article/article.controller';
import { ArticleService } from '@/module/article/article.service';

@Module({
    controllers: [ArticleController],
    providers: [ArticleService],
})
export class ArticleModule {}
