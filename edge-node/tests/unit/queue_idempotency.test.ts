import { enqueueWebhook } from '../../src/workers/queue';

const addMock = jest.fn();
const setMock = jest.fn();

jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: addMock,
        })),
    };
});

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
        set: setMock,
        ping: jest.fn(),
    }));
});

describe('enqueueWebhook idempotency', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('skips enqueue on duplicate idempotency key', async () => {
        // First call returns OK (set), second returns null (duplicate)
        setMock.mockResolvedValueOnce('OK').mockResolvedValueOnce(null);
        const payload = { hello: 'world' };
        await enqueueWebhook(payload, 'dup-key');
        await enqueueWebhook(payload, 'dup-key'); // should skip second add
        expect(addMock).toHaveBeenCalledTimes(1);
        expect(setMock).toHaveBeenCalledTimes(2);
    });
});
