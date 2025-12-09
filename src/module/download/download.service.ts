import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import { env } from '@/util/env';

@Injectable()
export class DownloadService {
    private readonly logger = new Logger(DownloadService.name);

    private readonly client = axios.create({
        baseURL: 'https://graph.microsoft.com/v1.0/',
    });

    constructor() {
        this.refreshToken().catch((err) => {
            this.logger.error('Failed to refresh access token', err.message);
        });
    }

    @Interval(30 * 60 * 1000)
    async refreshToken() {
        const url = `https://login.microsoftonline.com/${env.TENANT_ID}/oauth2/v2.0/token`;
        const data = new URLSearchParams({
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials',
        });
        const headers = {
            Authorization: `Basic ${Buffer.from(`${env.CLIENT_ID}:${env.CLIENT_SECRET}`).toString('base64')}`,
        };
        const res = await axios.post(url, data, { headers });
        const accessToken = res.data.access_token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    async getUrl(name: string): Promise<string> {
        try {
            const url = `/drive/items/${env.FOLDER_ID}:/${name}.apk`;
            const res = await this.client.get(url);
            return res.data['@microsoft.graph.downloadUrl'] as string;
        } catch (error) {
            if (error.response.status == 404) {
                throw new NotFoundException('File not found');
            }
            this.logger.error(`Failed to get download URL for ${name}`, error);
            throw error;
        }
    }
}
