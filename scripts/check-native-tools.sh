#!/usr/bin/env bash
# Verify that native lint/format binaries used by lint:native and pre-commit
# hooks are on PATH. Fails fast with an install hint so contributors don't hit
# cryptic errors from lint-staged or CI.

set -eu

missing=()
for tool in ktlint swiftformat clang-format; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    missing+=("$tool")
  fi
done

if [ "${#missing[@]}" -eq 0 ]; then
  exit 0
fi

echo "error: required native tools not found on PATH: ${missing[*]}" >&2
echo "" >&2
echo "These are needed by lint:native, format:native, and the pre-commit hook." >&2
echo "" >&2
case "$(uname -s)" in
  Darwin)
    echo "Install on macOS with Homebrew:" >&2
    echo "  brew install ${missing[*]}" >&2
    ;;
  Linux)
    echo "Install on Linux (Homebrew or your distro's package manager):" >&2
    echo "  brew install ${missing[*]}" >&2
    ;;
  *)
    echo "Install with your platform's package manager." >&2
    ;;
esac
echo "" >&2
echo "See CONTRIBUTING.md \"Local development setup\" for details." >&2
exit 1
