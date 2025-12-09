import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@/module/common/public.decorator';
import { ArticleService } from '@/module/article/article.service';

@Controller('/article')
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get(':name')
    @Public()
    getArticle(@Param('name') name: string) {
        return this.articleService.getArticle(name);
    }
}
