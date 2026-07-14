/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

import type { InboxMessage } from '../types';

jest.mock('../NativeMCModule', () => ({
  __esModule: true,
  default: {
    requestMcSdk: jest.fn().mockResolvedValue(undefined),
    refreshInbox: jest.fn(),
    getAllMessages: jest.fn(),
    getUnreadMessages: jest.fn(),
    getReadMessages: jest.fn(),
    getDeletedMessages: jest.fn(),
    getMessageCount: jest.fn(),
    getUnreadMessageCount: jest.fn(),
    getReadMessageCount: jest.fn(),
    getDeletedMessageCount: jest.fn(),
    markMessageRead: jest.fn(),
    markMessageDeleted: jest.fn(),
    markAllMessagesRead: jest.fn(),
    markAllMessagesDeleted: jest.fn(),
    trackInboxMessageOpened: jest.fn(),
    addTag: jest.fn(),
    addTags: jest.fn(),
    removeTag: jest.fn(),
    removeTags: jest.fn(),
    getTags: jest.fn(),
    enablePiAnalytics: jest.fn(),
    disablePiAnalytics: jest.fn(),
    isPiAnalyticsEnabled: jest.fn(),
    enableAnalytics: jest.fn(),
    disableAnalytics: jest.fn(),
    isAnalyticsEnabled: jest.fn(),
    getDeviceId: jest.fn(),
    setSignedString: jest.fn(),
    getSignedString: jest.fn(),
    enableLogging: jest.fn(),
    disableLogging: jest.fn(),
    setRegistrationCallback: jest.fn(),
    unsetRegistrationCallback: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  },
}));

type MockedNative = { [key: string]: jest.Mock };

const loadModule = (): {
  MarketingCloudSdkModule: typeof import('../MarketingCloudSdkModule').MarketingCloudSdkModule;
  Native: MockedNative;
} => {
  let mod!: typeof import('../MarketingCloudSdkModule');
  let native!: MockedNative;
  jest.isolateModules(() => {
    mod = require('../MarketingCloudSdkModule');
    native = require('../NativeMCModule').default;
  });
  return {
    MarketingCloudSdkModule: mod.MarketingCloudSdkModule,
    Native: native,
  };
};

const stubMessage = (overrides: Partial<InboxMessage> = {}): InboxMessage =>
  ({ id: 'm-1', ...overrides }) as InboxMessage;

describe('MarketingCloudSdkModule', () => {
  describe('requestSdk', () => {
    it('awaits requestMcSdk on first invocation', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      await MarketingCloudSdkModule.requestSdk();
      expect(Native.requestMcSdk).toHaveBeenCalledTimes(1);
    });

    it('caches the api on subsequent calls', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const a = await MarketingCloudSdkModule.requestSdk();
      const b = await MarketingCloudSdkModule.requestSdk();
      expect(a).toBe(b);
      expect(Native.requestMcSdk).toHaveBeenCalledTimes(1);
    });
  });

  describe('inbox retrieval', () => {
    it('forwards refreshInbox and returns its resolved value', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.refreshInbox.mockResolvedValue(true);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.refreshInbox()).resolves.toBe(true);
      expect(Native.refreshInbox).toHaveBeenCalledTimes(1);
    });

    it('routes the four inbox getters to the matching native calls', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const msgs = [stubMessage({ id: 'a' }), stubMessage({ id: 'b' })];
      Native.getAllMessages.mockResolvedValue(msgs);
      Native.getUnreadMessages.mockResolvedValue([msgs[0]]);
      Native.getReadMessages.mockResolvedValue([msgs[1]]);
      Native.getDeletedMessages.mockResolvedValue([]);
      const api = await MarketingCloudSdkModule.requestSdk();

      await expect(api.getAllMessages()).resolves.toEqual(msgs);
      await expect(api.getUnreadMessages()).resolves.toEqual([msgs[0]]);
      await expect(api.getReadMessages()).resolves.toEqual([msgs[1]]);
      await expect(api.getDeletedMessages()).resolves.toEqual([]);
    });

    it('routes the four count getters to the matching native calls', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.getMessageCount.mockResolvedValue(4);
      Native.getUnreadMessageCount.mockResolvedValue(2);
      Native.getReadMessageCount.mockResolvedValue(3);
      Native.getDeletedMessageCount.mockResolvedValue(5);
      const api = await MarketingCloudSdkModule.requestSdk();

      await expect(api.getMessageCount()).resolves.toBe(4);
      await expect(api.getUnreadMessageCount()).resolves.toBe(2);
      await expect(api.getReadMessageCount()).resolves.toBe(3);
      await expect(api.getDeletedMessageCount()).resolves.toBe(5);
    });
  });

  describe('inbox mutations', () => {
    it('forwards single-message read/delete with the given id', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.markMessageRead('id-1');
      api.markMessageDeleted('id-2');
      expect(Native.markMessageRead).toHaveBeenCalledWith('id-1');
      expect(Native.markMessageDeleted).toHaveBeenCalledWith('id-2');
    });

    it('routes markAllMessagesRead to the read native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.markAllMessagesRead();
      expect(Native.markAllMessagesRead).toHaveBeenCalledTimes(1);
      expect(Native.markAllMessagesDeleted).not.toHaveBeenCalled();
    });

    it('routes markAllMessagesDeleted to the delete native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.markAllMessagesDeleted();
      expect(Native.markAllMessagesDeleted).toHaveBeenCalledTimes(1);
      expect(Native.markAllMessagesRead).not.toHaveBeenCalled();
    });

    it('forwards trackInboxMessageOpened with the full message payload', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      const msg = stubMessage({ id: 'trk-1' });
      api.trackInboxMessageOpened(msg);
      expect(Native.trackInboxMessageOpened).toHaveBeenCalledWith(msg);
    });
  });

  describe('tags', () => {
    it('forwards add/remove for single and multi-tag variants', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.addTag('t1');
      api.addTags(['t2', 't3']);
      api.removeTag('t1');
      api.removeTags(['t2']);
      expect(Native.addTag).toHaveBeenCalledWith('t1');
      expect(Native.addTags).toHaveBeenCalledWith(['t2', 't3']);
      expect(Native.removeTag).toHaveBeenCalledWith('t1');
      expect(Native.removeTags).toHaveBeenCalledWith(['t2']);
    });

    it('returns the native tags array', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.getTags.mockResolvedValue(['a', 'b']);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.getTags()).resolves.toEqual(['a', 'b']);
    });
  });

  describe('analytics toggles', () => {
    it('routes enablePiAnalytics to the enable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.enablePiAnalytics();
      expect(Native.enablePiAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.disablePiAnalytics).not.toHaveBeenCalled();
    });

    it('routes disablePiAnalytics to the disable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.disablePiAnalytics();
      expect(Native.disablePiAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.enablePiAnalytics).not.toHaveBeenCalled();
    });

    it('returns true from isPiAnalyticsEnabled via the native call', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.isPiAnalyticsEnabled.mockResolvedValue(true);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.isPiAnalyticsEnabled()).resolves.toBe(true);
      expect(Native.isPiAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });

    it('returns false from isPiAnalyticsEnabled via the native call', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.isPiAnalyticsEnabled.mockResolvedValue(false);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.isPiAnalyticsEnabled()).resolves.toBe(false);
      expect(Native.isPiAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });

    it('routes enableAnalytics to the enable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.enableAnalytics();
      expect(Native.enableAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.disableAnalytics).not.toHaveBeenCalled();
    });

    it('routes disableAnalytics to the disable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.disableAnalytics();
      expect(Native.disableAnalytics).toHaveBeenCalledTimes(1);
      expect(Native.enableAnalytics).not.toHaveBeenCalled();
    });

    it('returns false from isAnalyticsEnabled via the native call', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.isAnalyticsEnabled.mockResolvedValue(false);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.isAnalyticsEnabled()).resolves.toBe(false);
      expect(Native.isAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });

    it('returns true from isAnalyticsEnabled via the native call', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.isAnalyticsEnabled.mockResolvedValue(true);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.isAnalyticsEnabled()).resolves.toBe(true);
      expect(Native.isAnalyticsEnabled).toHaveBeenCalledTimes(1);
    });
  });

  describe('device and signed string', () => {
    it('returns getDeviceId from the native call', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.getDeviceId.mockResolvedValue('device-1');
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.getDeviceId()).resolves.toBe('device-1');
    });

    it('forwards setSignedString with a string and returns the resolved value', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.setSignedString.mockResolvedValue(true);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.setSignedString('signed')).resolves.toBe(true);
      expect(Native.setSignedString).toHaveBeenCalledWith('signed');
    });

    it('forwards setSignedString with null to clear and returns the resolved value', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.setSignedString.mockResolvedValue(false);
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.setSignedString(null)).resolves.toBe(false);
      expect(Native.setSignedString).toHaveBeenCalledWith(null);
    });

    it('returns the native signed string', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.getSignedString.mockResolvedValue('signed');
      const api = await MarketingCloudSdkModule.requestSdk();
      await expect(api.getSignedString()).resolves.toBe('signed');
    });
  });

  describe('logging and registration', () => {
    it('routes enableLogging to the enable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.enableLogging();
      expect(Native.enableLogging).toHaveBeenCalledTimes(1);
      expect(Native.disableLogging).not.toHaveBeenCalled();
    });

    it('routes disableLogging to the disable native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.disableLogging();
      expect(Native.disableLogging).toHaveBeenCalledTimes(1);
      expect(Native.enableLogging).not.toHaveBeenCalled();
    });

    it('routes setRegistrationCallback to the set native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.setRegistrationCallback();
      expect(Native.setRegistrationCallback).toHaveBeenCalledTimes(1);
      expect(Native.unsetRegistrationCallback).not.toHaveBeenCalled();
    });

    it('routes unsetRegistrationCallback to the unset native call only', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const api = await MarketingCloudSdkModule.requestSdk();
      api.unsetRegistrationCallback();
      expect(Native.unsetRegistrationCallback).toHaveBeenCalledTimes(1);
      expect(Native.setRegistrationCallback).not.toHaveBeenCalled();
    });
  });

  describe('cache resilience', () => {
    it('propagates rejections from requestMcSdk without caching', async () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      Native.requestMcSdk.mockRejectedValueOnce(new Error('nope'));
      await expect(MarketingCloudSdkModule.requestSdk()).rejects.toThrow(
        'nope',
      );
      Native.requestMcSdk.mockResolvedValue(undefined);
      await MarketingCloudSdkModule.requestSdk();
      expect(Native.requestMcSdk).toHaveBeenCalledTimes(2);
    });
  });

  describe('getEmitter', () => {
    it('returns an event emitter bound to the native module', () => {
      const { MarketingCloudSdkModule, Native } = loadModule();
      const emitter = MarketingCloudSdkModule.getEmitter() as unknown as {
        nativeModule: unknown;
        addListener: unknown;
      };
      expect(typeof emitter.addListener).toBe('function');
      expect(emitter.nativeModule).toBe(Native);
    });

    it('caches the emitter', () => {
      const { MarketingCloudSdkModule } = loadModule();
      expect(MarketingCloudSdkModule.getEmitter()).toBe(
        MarketingCloudSdkModule.getEmitter(),
      );
    });
  });
});
