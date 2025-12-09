import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic'; // 元数据的 Key
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
