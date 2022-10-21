---
layout: default
title: Community Patterns
nav_order: 3
has_children: false
publish: false
parent: Requirements

---

# Community Patterns

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

General requirements for all Community, Validated, and Supported patterns

* _CP1._ Patterns **MUST** include a top-level README highlighting the business problem and how the pattern solves it
* _CP2._ Patterns **MUST** include an architecture drawing. The specific tool/format is flexible as long as the meaning is clear.
* _CP3._ Patterns **MUST** undergo an informal architecture review by a community leader to ensure that the solution has the right products, and they are generally being used as intended.  
For example: not using a database as a message bus.
As community leaders, contributions from within Red Hat may be subject to a higher level of scrutiny
While we strive to be inclusive, the community will have quality standards and generally using the framework does not automatically imply a solution is suitable for the community to endorse/publish. 
* _CP4._ Patterns **MUST** undergo an informal technical review by a community leader to ensure that it conforms to the [technical requirements](#) and meets basic reuse standards
* _CP5._ Patterns SHOULD include a recorded demo highlighting the business problem and how the pattern solves it
* _CP6._ Patterns **MUST** document their support policy
It is anticipated that most community patterns will be supported by the community on a best-effort basis, but this should be stated explicitly.  
The validated patterns team commits to maintaining the framework but will also accept help.
