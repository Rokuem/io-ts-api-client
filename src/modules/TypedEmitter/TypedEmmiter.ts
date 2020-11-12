export class TypedEmitter<
  Events extends Record<string, (...args: any[]) => void>
> {
  private listeners: Partial<
    {
      [key in keyof Events]: Set<(...args: Parameters<Events[key]>) => void>;
    }
  > = {};

  public on<K extends keyof Events>(
    ...[event, cb]:
      | [event: K, cb: Events[K]]
      | [
          'message',
          <E extends keyof Events>(
            ...args: [event: E, ...params: Parameters<Events[E]>]
          ) => void
        ]
  ) {
    this.listeners[event] = this.listeners[event] || (new Set() as any);

    const eventListeners = this.listeners[event];

    if (eventListeners) {
      eventListeners.add(cb as any);
    }
  }

  public off<K extends keyof Events>(event: K, cb: Events[K]): boolean {
    const eventListeners = this.listeners[event];

    if (!eventListeners) {
      return false;
    }

    eventListeners.delete(cb);
    return true;
  }

  public once<K extends keyof Events>(
    ...[event, cb]:
      | [event: K, cb: Events[K]]
      | ['message', (...args: any[]) => void]
  ) {
    const onceCb = (...args: Parameters<Events[K]>) => {
      cb(...args);
      this.off(event, onceCb as any);
    };

    this.on(event as any, onceCb as Events[K]);
  }

  public emit<K extends keyof Events>(
    ...[event, ...params]:
      | [K, ...Parameters<Events[K]>]
      | ['message', keyof Events, ...Parameters<Events[K]>]
  ) {
    if (event !== 'message') {
      //@ts-ignore
      this.emit('message', event, ...params);
    }

    const eventListeners = this.listeners[event];
    eventListeners?.forEach((cb: any) => cb(...(params as any)));
  }

  public resetListeners(event?: keyof Events) {
    if (event) {
      this.listeners[event]?.clear();
    } else {
      this.listeners = {};
    }
  }
}
