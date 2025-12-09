import { Controller, Get } from '@nestjs/common';
import { EndpointService } from './endpoint.service';
import { ItemsVo } from '@/module/common/items.vo';
import { EndpointVo } from '@/module/endpoint/endpoint.vo';

@Controller('/endpoint')
export class EndpointController {
    constructor(private readonly endpointService: EndpointService) {}

    @Get()
    getEndpoints(): ItemsVo<EndpointVo> {
        const endpoints = this.endpointService.getAll();
        return new ItemsVo(EndpointVo, endpoints);
    }
}
