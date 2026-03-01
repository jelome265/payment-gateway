#!/usr/bin/env bash

set -euxo pipefail

# Wrapper for Bazel CI execution (with remote cache config if available)

bazelisk build //...
bazelisk test //...
