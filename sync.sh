#!/bin/bash

s3cmd sync --acl-public docs/* s3://pelias.compare
