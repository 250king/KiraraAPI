import { TypedMessage } from '@/lib/common/serial/typed_message';
import { MessageFns } from '@/lib/common/serial/typed_message';

export const toTypedMessage = <T extends MessageFns<unknown, string>>(
    proto: T,
    data: Parameters<T['create']>[0],
): TypedMessage => {
    return TypedMessage.create({
        type: proto.$type,
        value: proto.encode(proto.create(data)).finish(),
    });
};
