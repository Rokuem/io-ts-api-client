import { TypedEmitter } from './TypedEmmiter';

describe('TypedEmitter', () => {
  describe('With a simple setup', () => {
    const emitter = new TypedEmitter<{
      event1: (payload: string) => string;
      event2: () => void;
    }>();

    beforeEach(() => {
      emitter.resetListeners();
    });

    test('Should listen to registered events and provide its message', () => {
      const cb = jest.fn();
      const message = 'test';
      emitter.on('event1', cb);
      emitter.emit('event1', message);
      expect(cb).toHaveBeenCalledWith(message);
      expect(cb).toBeCalledTimes(1);
    });

    test('Should not listen after disabling an event', () => {
      const cb = jest.fn();
      emitter.on('event2', cb);
      emitter.off('event2', cb);
      emitter.emit('event2');

      expect(cb).not.toHaveBeenCalled();
    });

    test('Disabling an event should not affect others', () => {
      const cb = jest.fn();
      const cb2 = jest.fn();
      emitter.on('event2', cb);
      emitter.on('event2', cb2);
      emitter.off('event2', cb);
      emitter.emit('event2');

      expect(cb).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    test('Using .once should handle the event only once', () => {
      const cb = jest.fn();
      emitter.once('event2', cb);
      emitter.emit('event2');
      emitter.emit('event2');

      expect(cb).toHaveBeenCalledTimes(1);
    });

    test('Disabling an event that does not exist should return false', () => {
      const disabled = emitter.off('unknown' as any, () => {});
      expect(disabled).toBe(false);
    });

    test('Should be able to clear all events of one type', () => {
      const cb = jest.fn();
      const cb2 = jest.fn();
      emitter.on('event1', cb);
      emitter.on('event2', cb2);

      emitter.resetListeners('event1');

      emitter.emit('event1', '');
      emitter.emit('event2');

      expect(cb).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    test('When emitting an event, the generic message event should also be emitted', () => {
      const cb = jest.fn();
      emitter.on('message', cb);
      emitter.emit('event2');

      expect(cb).toHaveBeenCalled();
    });
  });
});
