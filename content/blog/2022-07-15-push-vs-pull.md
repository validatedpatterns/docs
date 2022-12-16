---
date: 2022-07-15
title: Push or Pull?
summary: Considerations on Push and Pull in change management systems
author: Martin Jackson
blog_tags:
- ansible-edge-gitops
- patterns
- GitOps
aliases: /2022/07/15/push-vs-pull/
---

# Push or Pull? Strategies for Large Scale Technology Change Management on the Edge

## What is Technology Change Management?

There is a segment of the technology industry dedicated to keeping track of what is changing in an IT environment, when and how. These include systems like Service Now, Remedy, JIRA, and others. This is definitely a kind of change management, and these systems are important - but the focus of this blog post is not how the work of change management is tracked, but the actual means and strategy of doing those changes.

Edge technology solutions involve hardware and software, and they all require some kind of technology maintenance. Our focus here is on software maintenance - these task can involve updating applications, patching underlying operating systems, performing remote administration - restarting applications and services. Coordinating change for a complex application can be daunting for a centralized datacenter application - but on the Edge, where we have hundreds, thousands, maybe millions of devices and application instances to keep track of, it is harder.

## What Do You Mean, Push or Pull?

In this article, we are going to discuss two primary strategies for systems that are responsible for making and recording changes on other systems. We are making the assumption here that the system in question is making changes and also recording the results of those changes for later review or troubleshooting. Highly regulated organizations often have audit requirements to show that their financial statements are accurate, and this means demonstrating that there are business processes in place to authorize and schedule changes.

In this context, when we say "Push", we mean that a hub or centralized system originates and makes changes on other systems. The key differentiator is that the "Push" system stays in contact with the managed system throughout the process of the change. The "Push" system may also keep a record of changes made for its own purposes.

In a "Pull" system, on the other hand, the centralized system waits for managed systems to connect to it to get their configuration instructions. "Pull" systems often have agents that use a dedicated protocol to define changes. There may be several steps in a "Pull" conversation, as defined by the system. A "Pull" system might also be able to cache and apply a previous configuration. The key differentiator of a "Pull" system is that it does not need to maintain constant contact with the central system to do its work.

Push and Pull, in this context represent "strategies" for managing change. A given system can have both "push" and "pull" aspects; for example, ansible has an `ansible-pull` command which clearly works in a "pull" mode, even though most people recognize ansible as being primarily a push based system. While specific systems or products may be mentioned, the goal is not to evaluate systems themselves, but to talk about the differences and the relative merits and pitfalls of push and pull as strategies for managing change.

## What do you mean by "Large"?

The term "Large" is quoted because it can mean different things in different contexts. For change management systems, it can include, but is not necessarily limited to:

* *The count of individual systems managed*

As an arbitrary number, a system that manages 10,000 systems could probably be considered "large" regardless of other considerations. But sheer numbers of managed systems are only one aspect in play here. But you may still have a "large" problem if you do not have that many instances. Sheer volume of managed systems impose many constraints on systems that have to change and track other systems - records of changes have to be stored and indexed; there has to be a way to represent the different desired configurations.

* *The complexity of different configurations across those systems*

The *number* of configurations represented across your fleet might be a better predictor for how "large" the problem is. It is easier to manage 10 configurations with 1,000 instances each than to manage 50 configurations with 100 instances each, for example.

* *The organizational involvement in managing configurations*

Fleets have a certain team overhead in managing them as they grow. Who decides what hardware gets deployed, and when? Who decides when new Operating System versions are rolled out? Who does testing? If there are several teams involved in these activities, the problem is almost certainly a "large" one.

* *The geographic distribution of systems managed*

Another aspect of complexity is how widely dispersed the fleet is. It is easier to manage 10,000 instances in one or even two locations than it is to manage 5 instances in each of 2,000 locations. Geographic distribution also includes operating in multiple legal jurisdictions, and possible in multiple nations. These impose requirements of various kinds on systems and thus also on the systems responsible for maintaining and changing them.

* *It feels like a "large" problem to you*

If none of the other criteria listed so far apply to you, but it still feels like a "large" problem to you, it probably is one.

## Managing Change - An Ongoing Challenge

In a perfect world, we could deploy technology solutions that maintain themselves. We would not need to update them; they would know how to update themselves. They could coordinate outage times, and could ensure that they can run successfully on a proposed platform. They would know about their own security vulnerabilities, and know how to fix them. Best of all, they could take requests from their users, turn those into systematic improvements, and deploy them without any other interaction.

## What is the Edge?

Are you laughing yet? Most of the work of IT administrators is done in one of the areas listed above. Even very competent IT organizations sometimes struggle balancing some of these priorities. One aspect of the current computing environment is the prominence of Edge computing, which places its focus on the devices and applications that use computing resources far from central clouds and data centers - these compute resources run in retail stores, in pharmacies, hospitals, and warehouses; they run in cars and sometimes even spacecraft. In Edge environments, compute resources have to deal with intermittent network connectivity, if they have network connectivity at all. Sometimes, groups of devices have access to local server resources - as might the case in a large retail store, or in a factory or warehouse - but sometimes the closest "servers" are in the cloud and centralized. One interesting aspect of Edge deployments is that there are often many copies of effectively the same deployment. A large chain retail store might deploy the same set of applications to each of its stores. In such an installation, there may be many devices of a single type installed in that location. Think of the number of personal computers or cash registers you can see at a large retail store, for example. It would not be unusual to have ten PCs and twenty cash registers (per store) in this kind of deployment. And a large retail chain could have hundreds or even thousands of locations. Newer technologies, like Internet of Things deployments, require an even higher degree of connectivity - the single retail store example we are considering could have three *hundred* cameras to manage, which would need to be integrated into its IoT stack. And there could be hundreds, or thousands, of sites just like this one. The scope and scale of systems to manage can get daunting very quickly.

So, some of the defining qualities of Edge environments are: scale (anyone operating some edge installations probably has a lot of edge installations, and the success of their business depends on them operating more of them) and network limitations (whether there is a connection at all, and if so, how reliable it is; bandwidth - how much data it can transfer at a time; and latency - how long it takes to get where it is going). This makes making changes in these environments challenging, because it means keeping track of large numbers of entities in an environment where our ability to contact those entities and verify their status may be limited if it is present at all. But we still must make changes in those environments, because those solutions need maintenance - their platforms may need security updates; their operators may want to update application features and functionality. This requires us to make changes to these devices, and requires technology change management.

## Consideration: Workload Capacity Management

Workload Capacity Management focuses on what is needed to manage the scale of deployments. With large Edge deployments, the work needs to get done, and that work needs to be replicated on every node in scope for the deployment - so the same job or configuration content may need to apply to hundreds, thousands, or more individual nodes. Since the control point (central or distributed) is different between push and pull based systems, how they distribute the work needed to distribute changes. Push based systems must send the work out directly; but pull-based systems can potentially overwhelm a centralized system with a "thundering herd."

## Common Consideration: Inventory/Data Aggregation

Inventory and Data Aggregation are crucial considerations for both kinds of systems. Inventory is the starting point for determining what systems are in scope for a given unit of work; data aggregation is important to them because as units of work get done, we often need proof or validation that the work was done. With large numbers of edge nodes, there are certain to be exceptions, and the ability to keep track of where the work is crucial to completing the task.

## Common Consideration: Authentication/Authorization

Since these systems are responsible for making changes on devices, how they interact with authentication and authorization systems is an important aspect of how they work. Is the user who the user claims to be? Which users are allowed to make which changes? Authentication and authorization are things we must consider for systems that make changes. Additionally many large organizations have additional technology requirements for systems that can make changes to other systems.

## Common Consideration: Dealing with Network Interruptions

In Edge deployments, network connectivity is by definition limited, unreliable, or non-existent. There are differences in how respective types of systems can detect and behave in the presence of network interruptions.

## Common Consideration: Eventual Consistency / Idempotence

Regardless of whether a system is push-based or pull-based, it is valuable and useful for the configuration units managed by that system to be safe to apply and re-apply at will. This is the common meaning of the term *idempotence*. One strategy for minimizing the effect of many kinds of problems in large-scale configuration management is writing content that is *idempotent*, that is, the effect of running the same content multiple times is the same as the effect of running it once. Practically speaking, this means that such systems make changes only when they need to, and do not have "side effects". This makes it safe to run the same configuration content on the same device many times, so if it cannot be determined whether a device has received a particular configuration or not, the solution would be to apply the configuration to it, and the devices should then be in the desired, known state when the configuration is done.

## Approach 1: Push Strategy

The first approach we will consider is the "push" strategy. In a "push" strategy, the centralized change management system itself reaches out to managed devices and triggers updates in some way. This could involve making an API call to a device, logging in to a device through SSH, or using a dedicated client/server protocol. Red Hat's Ansible operates as a push-based system, where a central console reaches out to devices and manages them.

### Push Consideration: Workload Capacity Management

A push based system has much more control over how it parcels out configuration workload, since it is in control of how configuration workloads are driven. It can more easily perceive its own load state, and potentially "back off" or "throttle" if it is processing too much work too quickly - or increase it if the scope of the desired change is smaller than the total designed capacity of the system. It is easier to influence the "rate of change" on a push-based system for this reason.

### Push Consideration: Dealing with Network Interruptions

Push-based systems are at a disadvantage when dealing with network interruptions and limitations. The most common network failure scenarios are ambiguous: if an attempt to reach an individual device fails, is that because there was a problem with the device, or a problem with the network path to reach the device? The push-based system can only know things about the devices it manages when it is told. An additional potential with network interruption is that a device can successfully apply a unit of configuration change but can fail to report that because of a network problem - the report is dropped, for example, because of a network path outage or problem, or the central collection infrastructure was overwhelmed. In such a situation, it is best to have the option to re-apply the configuration, for which it is best if you can have the confidence that such configuration will not have any undesired side-effects, and will only make the changes it needs to make.

## Approach 2: Pull Strategy

The second approach we will consider is the "pull" strategy. The key difference in the "pull" strategy is that devices themselves initiate communication with the central management system. They can do this by making a request to the management system (which can be a notification, API call, or some other mechanism). That is to say - the central management system "waits" for check-ins from the managed devices. Client-server Puppet is a pull-based system, in which managed devices reach out to server endpoints, which give the devices instructions on what configurations to apply to themselves. Puppet also has options for operating in a push-based model; historically this could be done through `puppet kick`, mcollective orchestration, application orchestration, or bolt.

### Pull Consideration: Workload Capacity Management

Pull-based systems have some challenges in regard to workload capacity for the pieces that need to be centralized (particularly reporting and inventory functions). The reason for this is that the devices managed will not have a direct source of information about the load level of centralized infrastructure, unless this is provided by an API; some load balancing schemes can do this in a rudimentary way by directing new requests to an instance via a "least connection" balancing scheme. Large deployments typically have to design a system to stagger check-ins to ensure the system does not get overwhelmed by incoming requests.

### Pull Consideration: Authentication/Authorization

Pull-based systems typically have agents that run on the systems that are managed, and as such are simpler to operate from an authentication and authorization standpoint. Agents on devices can often be given administrative privilege, and the practical authentication/authorization problems have to do with access to the central management console, and the ability to change the configurations distributed or see the inventory and reports of attempts to configure devices.

### Pull Consideration: Dealing with Network Interruptions

Pull-based systems have a distinct advantage when they encounter network interruptions. While it is in no way safe to assume that a managed device is still present or relevant from the standpoint of central infrastructure, it is almost always safe for a device, when it finds it cannot connect central infrastructure, to assume that it is experiencing a temporary network outage, and to simply retry the operation later. Care must be taken, especially in large deployments, not to overwhelm central infrastructure with requests. Additionally, we must remember that since network interruption can occur at any time on the edge, that the operation we are interested in may indeed have completed successfully, but the device was simply unable to report this to us for some reason. As was the case for push-based systems, the best cure for this is to ensure that content can be safely re-applied as needed or desired.

# Conclusions

## Push and Pull based systems have different scaling challenges as they grow

Push and Pull-based systems have different tradeoffs. It can be easier to manage a push-based system for smaller numbers of managed devices; some of the challenges of both styles clearly increase as systems grow to multiple thousands of nodes.

Meanwhile, both push and pull based systems, as a practical matter, have to make sense and be usable for small installations as well as large, and grow and scale as smoothly as possible. Many installations will never face some or maybe even any of these challenges - and systems of both types must be easy to understand and learn, or else they will not be used.

## Pull-based systems are better for Edge uses despite scaling challenges

Pull based systems can deal better with the network problems that are inherent with edge devices. When connectivity to central infrastructure is unreliable, pull-based systems can still operate. Pull-based systems can safely assume that a network partition is temporary, and thus do not suffer from the inherent ambiguity of "could not reach target system" kinds of errors.

## Idempotence matters more than whether a system is push or pull based

The fix for nearly all the operational problems in large scale configurations management problems is to be able to apply the same configuration to the same device multiple times and expect the same result. This takes discipline and effort, but that effort pays off well in the end.

## To help scale, introduce a messaging or queuing layer to hold on to data in flight if possible

Many of the operational considerations are related to limited network connectivity or overtaxing centralized infrastructure. Both of these problems can be mitigated significantly by introducing a messaging or queuing layer in the configuration management system to hold on to reports, results, and inventory updates until the system can confirm receipt and processing of those elements.
