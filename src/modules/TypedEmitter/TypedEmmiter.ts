export class TypedEmitter<
  Events extends Record<string, (...args: any[]) => void>
> {
  private listeners: Partial<
    {
      [key in keyof Events]: Set<(...args: any[]) => void>;
    }
  > = {};

  public on<K extends keyof Events>(event: K | 'message', cb: Events[K]) {
    this.listeners[event] = this.listeners[event] || (new Set() as any);

    const eventListeners = this.listeners[event];

    if (eventListeners) {
      eventListeners.add(cb);
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

  public once<K extends keyof Events>(event: K | 'message', cb: Events[K]) {
    const onceCb = (...args: Parameters<Events[K]>) => {
      cb(...args);
      this.off(event, onceCb as any);
    };

    this.on(event, onceCb as Events[K]);
  }

  public emit<K extends keyof Events>(
    ...args: [K, ...Parameters<Events[K]>] | ['message', keyof Events]
  ) {
    if (args[0] !== 'message') {
      this.emit('message', args[0]);
    }
    const eventListeners = this.listeners[args[0]];
    eventListeners?.forEach((cb) => cb(args[1] as any));
  }

  public resetListeners(event?: keyof Events) {
    if (event) {
      this.listeners[event]?.clear();
    } else {
      this.listeners = {};
    }
  }
}
