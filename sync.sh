#!/bin/bash

s3cmd sync --acl-public dist/* s3://pelias.compare
