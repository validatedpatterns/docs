---
layout: default
title: Patterns
nav_order: 2
has_children: true
---

# Pattern List
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

## Patterns quick-start
Each pattern can be deployed using the command line. Check the `values-*.yaml` for changes that are needed before deployment. After changing the `values-*.yaml` files where needed and pushing them to your git reposistory, you can run `make install` from your local repository directory and that will deploy the datacenter/hub cluster for a pattern. Edge clusters are deployed by joining/importing them into ACM on the hub. 
 
Alternatively to the `make install` you can use the [validated pattern operator](https://operatorhub.io/operator/patterns-operator) available in the OpenShift console.

For information on using the Validated Patterns Operator please see [Using the Validated Pattern Operator](infrastructure/using-validated-pattern-operator.md)

Please follow any other post-install instructions for the pattern on that pattern's Getting started page.  
