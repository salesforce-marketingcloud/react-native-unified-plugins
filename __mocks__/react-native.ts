/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 *
 * Minimal react-native stub for Jest. Only the surface the wrapper modules
 * touch: NativeEventEmitter and TurboModuleRegistry.getEnforcing. Tests
 * override the emitter listener behavior per-test via jest.spyOn on this
 * class's prototype.
 */

export type EmitterSubscription = {
  remove: jest.Mock;
};

export class NativeEventEmitter {
  public readonly nativeModule: unknown;
  public readonly listeners: Array<{
    event: string;
    listener: (...args: unknown[]) => void;
    subscription: EmitterSubscription;
  }> = [];

  constructor(nativeModule?: unknown) {
    this.nativeModule = nativeModule;
  }

  addListener(
    event: string,
    listener: (...args: unknown[]) => void,
  ): EmitterSubscription {
    const entry = {
      event,
      listener,
      subscription: undefined as unknown as EmitterSubscription,
    };
    entry.subscription = {
      remove: jest.fn(() => {
        const i = this.listeners.indexOf(entry);
        if (i >= 0) this.listeners.splice(i, 1);
      }),
    };
    this.listeners.push(entry);
    return entry.subscription;
  }

  emit(event: string, ...args: unknown[]): void {
    for (const entry of this.listeners) {
      if (entry.event === event) entry.listener(...args);
    }
  }

  removeAllListeners(): void {
    this.listeners.length = 0;
  }
}

export type TurboModule = Record<string, unknown>;

export const TurboModuleRegistry = {
  getEnforcing<T>(_name: string): T {
    return new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === 'then') return undefined;
          return (..._args: unknown[]) => undefined;
        },
      },
    ) as T;
  },
};

export default {
  NativeEventEmitter,
  TurboModuleRegistry,
};
