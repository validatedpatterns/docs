---
layout: default
title: Validated Patterns
nav_order: 6
has_children: false
publish: false
parent: Workflow

---

# Community Pattern Requirements

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## tl;dr

* **What are they:** Technical foundations, backed by CI, that have succeeded in the market and Red Hat expects to be repeatable across customers and segments.  
* **Purpose:** Reduce risk, accelerate sales cycles, and allow consulting organizations to be more effective.
* **Creator:** The Validated Patterns team in conjunction with: Partners, GSIs, Services/Consultants, SAs, and other Red Hat teams
 
## Onboarding Existing Implementations

The Validated Patterns team has a preference for empowering other, and not
taking credit for their work.
 
Where there is an existing application/demo, there is also a strong preference
for the originating team to own any changes that are needed for the
implementation to become a validated pattern.  Alternatively, if the Validated
Patterns team drives the conversion, then in order to prevent confusion and
duplicated efforts, we are likely to ask for a commitment to phase out use of
the previous implementation for future engagements such as demos, presentations,
and workshops.

The goal is to avoid bringing a parallel implementation into existence which
divides Red Hat resources, and creates confusion internally and with customers
as the implementations drift apart.
 
In both scenarios the originating team can choose where to host the primary
repository, will be given admin permissions to any fork in
https://github.com/hybrid-cloud-patterns, and will receive on-going assistance
from the Validated Patterns team.
 
## Requirements

Validated Patterns have deliverable and requirements in addition to those
specified for Community-level patterns

### Must
1. Validated Patterns **MUST** contain more than two RH products. Alternative: Engage with the BU
1. Validated Patterns, or the solution on which they are based, **MUST** have been deployed and approved for use in at least one customer environment.

   Alternative: Community Pattern

1. Validated Patterns **MUST** be meaningful without specialized hardware, including flavors of architectures not explicitly supported. Alternative: Engage with DCI

   Qualification is a Validated Patterns engineering decision with input from the pattern owner.

1. Validated Patterns **MUST** be broadly applicable. Alternative: Engage with Phased Gate and/or TAMs

   Qualification is a Validated Patterns PM decision with input from the pattern owner. 

1. Validated Patterns **MUST** only make use of Red Hat products that are already fully supported by their product team(s).
1. Validated Patterns **MUST NOT** rely on functionality in tech-preview, or hidden behind feature gates.
1. Validated Patterns **MUST** conform to the same Community-level implementation requirements
1. Validated Patterns **MUST** have their architectures reviewed by the PM, TPM, or TMM of each Red Hat product they consume to ensure consistency with the product teams’ intentions and roadmaps
1. Validated Patterns **MUST** have their implementation reviewed by the patterns team to ensure that it is sufficiently flexible to function across a variety of platforms, customer environments, and any relevant verticals. 
1. Validated Patterns **MUST** include a standardized architecture drawing, created with (or at least conforming to) the PAC tooling
1. Validated Patterns **MUST** include a presentation deck oriented around the business problem being solved and intended for use by the field to sell and promote the solution
1. Validated Patterns **MUST** include a recorded demo highlighting the business problem and how the pattern solves it
1. Validated Patterns **MUST** include a test plan covering all features or attributes being highlighted by the demo that also spans multiple products.  Negative flow tests (such as resiliency or data retention in the presence of network outages) are limited to scenarios covered by the demonstration script.
1. Validated Patterns **MUST** include automated CI testing that runs on every change to the pattern, or a schedule no less frequently than once per week
1. Validated Patterns **MUST** create a new point release of the validation-level deliverables when minor versions (eg. “12” in OpenShift 4.12) of consumed products change
1. Validated Patterns **MUST** document their support policy

   The individual products used in a Validated Pattern are backed by the full Red Hat support experience conditional on the customer’s subscription to those products, and the individual products’ support policy. 
   Additional components in a Validated Pattern that are not supported by Red Hat (eg. Hashicorp Vault, and Seldon Core) will require a customer to obtain support from that vendor directly.
   The validated patterns team is very motivated to address any problems in the VP Operator, as well as problems in the common helm charts, but cannot not offer any SLAs at this time.
   See also our standard disclaimer

1. Validated Patterns **DO NOT** imply an obligation of support for partner or community operators by Red Hat.

### Should

1. Validated Patterns SHOULD focus on functionality not performance.
1. Validated Patterns SHOULD trigger CI runs for new versions of consumed products 
1. Validated Patterns SHOULD provide an RHPDS lab environment

   A bare bones environment into which the solution can be deployed, and a list of instructions for doing so (eg. installing and configuring OpenShift GitOps)

1. Validated Patterns SHOULD provide pre-built demo environment using RHPDS

   Having an automated demo within the RHPDS system, that will be built based on the current stable version that is run against the CI testing system

1. Validated Patterns SHOULD track deployments of each validation-level deliverable

   For lifecycle decisions like discontinuing support of a version
   For notification if problems are found in our CI

### Can

1. Teams creating Validated Patterns CAN provide their own SLA

   A document for QE that defines, at a technical level, how to validate if the pattern has been successfully deployed and is functionally operational.
   Example: [Validating an Industrial Edge Deployment](https://docs.google.com/document/d/12KQhdzjVIsxRURTnWAckiEMB3_96oWBjtlTXi1q73cg/view)
