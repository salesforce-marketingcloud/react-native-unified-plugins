How To License Info
-------------------

This project is licensed under the [BSD 3-Clause License](https://opensource.org/license/bsd-3-clause/). The BSD 3-Clause license is a permissive open-source license approved by Salesforce legal for use on this project. If you strongly feel a different license clause should be used, please engage with the legal team.

For the BSD 3-Clause license, a `LICENSE.md` file is placed at the root of the repository (and inside each package under `packages/`) containing:

```
Copyright 2026 Salesforce, Inc

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

A shorter version of the license header should be added as a comment to all Salesforce-authored source and configuration files that support comments. This includes file formats like TypeScript, JavaScript, Kotlin, Swift, Groovy, XML, YAML, etc. Example header:

```
/*
 * Copyright 2026 Salesforce, Inc
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Licensed under the BSD 3-Clause License; you may not use this file except in
 * compliance with the License. You may obtain a copy of the License in the
 * LICENSE.md file at the root of this repository, or at:
 *
 *     https://opensource.org/license/bsd-3-clause/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
```

Note that there are many tools that exist to do this sort of thing in an automated fashion, without having to manually edit every single file in your project. It is highly recommended that you research some of these tools for your particular language / build system.

Each package under `packages/` also declares `"license": "BSD-3-Clause"` in its `package.json` so that npm renders the license correctly on the package page.

Sample, demo, and example code (such as anything under `example/`) inherits the same BSD 3-Clause license via the root `LICENSE.md`; no per-file license header is required for those files.
