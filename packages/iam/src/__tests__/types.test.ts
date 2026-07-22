/**
 * @license
 * Copyright 2026 Salesforce, Inc
 * BSD-3-Clause
 */

import { IamEvent } from "../types";

describe("IamEvent", () => {
  it("pins the wire-format string constants", () => {
    // Native emits these exact strings; JS consumers subscribe to these
    // constants. A rename on either side is a breaking change.
    expect(IamEvent).toEqual({
      WillShowMessage: "sfmc_iam_will_show",
      DidShowMessage: "sfmc_iam_did_show",
      DidCloseMessage: "sfmc_iam_did_close",
    });
  });

  it("exposes exactly three event names", () => {
    expect(Object.keys(IamEvent)).toHaveLength(3);
  });
});
