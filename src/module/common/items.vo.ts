import { ClassConstructor, plainToInstance } from 'class-transformer';

export class ItemsVo<T> {
    constructor(cls: ClassConstructor<T>, data: any[]) {
        this.total = data.length;
        this.items = plainToInstance(cls, data);
    }

    items: T[];

    total: number;
}
