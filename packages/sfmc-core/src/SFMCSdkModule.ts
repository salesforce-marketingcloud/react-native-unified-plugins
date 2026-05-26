/**
 * @license
 * Copyright 2026 Salesforce, Inc
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 * @class SFMCSdkModule
 */

import { NativeEventEmitter } from 'react-native';
import NativeModule from './NativeSFMCSdkCoreModule';
import type { SFMCSdkApi } from './types';
import type { SFMCEvent } from './events';

let _api: SFMCSdkApi | null = null;
let _emitter: NativeEventEmitter | null = null;

export const SFMCSdkModule = {
  async requestSdk(): Promise<SFMCSdkApi> {
    if (_api) return _api;
    await NativeModule.requestSfmcSdk();
    _api = {
      setProfileId: (profileId: string) => NativeModule.setProfileId(profileId),
      setAttribute: (key: string, value: string) => NativeModule.setAttribute(key, value),
      clearAttribute: (key: string) => NativeModule.clearAttribute(key),
      setAttributes: (attributes: { [key: string]: string }) => NativeModule.setAttributes(attributes),
      getAttributes: () => NativeModule.getAttributes() as Promise<{ [key: string]: string } | null>,
      clearAllAttributes: () => NativeModule.clearAllAttributes(),
      getProfileId: () => NativeModule.getProfileId(),
      getPartyIdentificationName: () => NativeModule.getPartyIdentificationName(),
      setPartyIdentificationName: (name: string) => NativeModule.setPartyIdentificationName(name),
      getPartyIdentificationNumber: () => NativeModule.getPartyIdentificationNumber(),
      setPartyIdentificationNumber: (numberValue: string) => NativeModule.setPartyIdentificationNumber(numberValue),
      getPartyIdentificationType: () => NativeModule.getPartyIdentificationType(),
      setPartyIdentificationType: (type: string) => NativeModule.setPartyIdentificationType(type),
      track: (event: SFMCEvent) => NativeModule.track(event as unknown as Object),
      setLogging: (level: 'DEBUG' | 'WARN' | 'ERROR' | 'NONE') => NativeModule.setLogging(level),
      getSdkState: () => NativeModule.getSdkState() as Promise<{ [key: string]: any }>,
      sendImmediate: (event: SFMCEvent) => NativeModule.sendImmediate(event as unknown as Object),
      flush: () => NativeModule.flush(),
    };
    return _api;
  },

  getEmitter(): NativeEventEmitter {
    if (!_emitter) _emitter = new NativeEventEmitter(NativeModule);
    return _emitter;
  },
};
