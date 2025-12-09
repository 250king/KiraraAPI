import { Injectable, NotFoundException } from '@nestjs/common';
import { readdirSync } from 'node:fs';
import { env } from '@/util/env';
import { readFileSync } from 'fs';

@Injectable()
export class ArticleService {
    private readonly articles = new Map<string, string>();

    constructor() {
        const files = readdirSync(`${env.CONFIG_PATH}/article`);
        for (const file of files) {
            if (!file.endsWith('.md')) {
                continue;
            }
            const name = file.replace('.md', '');
            const content = readFileSync(`${env.CONFIG_PATH}/article/${file}`, 'utf-8');
            this.articles.set(name, content);
        }
    }

    getArticle(name: string): string {
        if (!this.articles.has(name)) {
            throw new NotFoundException('文章不存在');
        }
        return this.articles.get(name)!;
    }
}
