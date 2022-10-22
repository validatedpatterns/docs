---
layout: default
title: Community Patterns
nav_order: 3
has_children: false
publish: true
parent: Workflow

---

# Community Pattern Requirements

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

## tl;dr

* **What are they:** Best practice implementations conforming to the Validated Patterns implementation practices
* **Purpose:** Codify best practices and promote collaboration between different groups inside, and external to, Red Hat
* **Creator:** Customers, Partners, GSIs, Services/Consultants, SAs, and other Red Hat teams

## Requirements

General requirements for all Community, and Validated patterns

### Base
1. Patterns **MUST** include a top-level README highlighting the business problem and how the pattern solves it
1. Patterns **MUST** include an architecture drawing. The specific tool/format is flexible as long as the meaning is clear.
1. Patterns **MUST** undergo an informal architecture review by a community leader to ensure that the solution has the right products, and they are generally being used as intended.  

   For example: not using a database as a message bus.
   As community leaders, contributions from within Red Hat may be subject to a higher level of scrutiny
   While we strive to be inclusive, the community will have quality standards and generally using the framework does not automatically imply a solution is suitable for the community to endorse/publish. 

1. Patterns **MUST** undergo an informal technical review by a community leader to ensure that it conforms to the [technical requirements]([#](/requirements/implementation/)) and meets basic reuse standards
1. Patterns **MUST** document their support policy

   It is anticipated that most community patterns will be supported by the community on a best-effort basis, but this should be stated explicitly.  
   The validated patterns team commits to maintaining the framework but will also accept help.

1. Patterns SHOULD include a recorded demo highlighting the business problem and how the pattern solves it
