---
title: Ideas for Customization
weight: 60
aliases: /multicloud-gitops/ideas-for-customization/
---

# Ideas for customization

# Why change it?

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. The Multicloud Gitops is just an example of a pattern managing multiple clusters in a gitops fashion. It contains a very simple 'config-demo' application which prints out a secret that was injected into the vault via an out-of-band mechanism.

It could be an interesting exercise to customize this demo in different ways.

# Split the config-demo across hub and regional clusters

Currently hub and regional clusters are reusing the exact same helm chart found at `charts/all/config-demo`. The first customization step could be to split the demo app in two separate charts: one in `charts/hub/config-demo` and one in `charts/region/config-demo`. Once `charts/all/config-demo` has been copied to `charts/hub/config-demo` and `charts/region/config-demo`, we need to include them in the respective `values-hub.yaml` and `values-region-one.yaml`, respectively.

Once this is done we can start customizing the two apps and make them output a different web page entirely depending if the pod is running on the hub or on the cluster.

# Rest API addition

Another idea, after splitting the charts, could be to implement a small Rest API server on the hub. This API could serve read-only values out to anyone and could provide some update write-APIs only if the client provides a secret (for example via the X-API-KEY mechanism). The config-demo application could be tweaked to talk to the hub and use a vault-injected secret as the X-API-KEY. So the hub would possess the key via the External-Secrets generated K8s secret and the regional app would possess that same secret via the ACM policy pushing out secrets via the `{{hub fromSecret}}` mechanism.

In the end the possibilities to tweak this pattern are endless. Do let us know if you have an awesome idea that you'd like to add

>Contribute to this pattern:
[Help & Feedback](https://groups.google.com/g/validatedpatterns){: .btn .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Report Bugs](https://github.com/validatedpatterns/multicloud-gitops/issues){: .btn .btn-red .fs-5 .mb-4 .mb-md-0 .mr-2 }
