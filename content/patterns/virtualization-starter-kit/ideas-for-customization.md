---
title: Ideas for Customization
weight: 60
aliases: /virtualization-starter-kit/ideas-for-customization/
---

# Ideas for Customization

# Why change it?

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. Maybe you are not interested in Ignition as an application, or you do not have kiosks...but you do have other use cases that involve running containers on edge devices. Maybe you want to experiment with different releases of RHEL, or you want to do something different with Ansible Automation Platform.

This demo in particular can be customized in a number of ways that might be very interesting - and here are some starter ideas with some instructions on exactly what and where changes would need to be made in the pattern to accommodate those changes.

# HOWTO define your own VM sets using the chart

1. Use the external [chart](https://github.com/validatedpatterns/edge-gitops-vms-chart) and pass new values to it.

The `vms` data structure is designed to support multiple groups and types of VMs. The example defines all of the variables currently supported by the chart, including references to the Vault instance and port definitions.  If, for example, you wanted to replace server with new iotsensor and iotgateway types, the whole file might look like this:

```yaml
---
secretStore:
  name: vault-backend
  kind: ClusterSecretStore

cloudInit:
  defaultUser: 'cloud-user'
  defaultPassword: '6toh-n1d5-9xpq'

vms:
  iotsensor:
    count: 4
    flavor: small
    workload: server
    os: rhel8
    role: iotgateway
    storage: 20Gi
    memory: 2Gi
    cores: 1
    sockets: 1
    threads: 1
    cloudInitUser: cloud-user
    cloudInitPassword: 6toh-n1d5-9xpq
    template: rhel8-server-small
    sshsecret: secret/data/hub/iotsensor-ssh
    sshpubkeyfield: publickey
    ports:
      - name: ssh
        port: 22
        protocol: TCP
        targetPort: 22
  iotgateway:
    count: 1
    flavor: medium
    workload: server
    os: rhel8
    role: iotgateway
    storage: 30Gi
    memory: 4Gi
    cores: 1
    sockets: 1
    threads: 1
    cloudInitUser: cloud-user
    cloudInitPassword: 6toh-n1d5-9xpq
    template: rhel8-server-medium
    sshsecret: secret/data/hub/iotgateway-ssh
    sshpubkeyfield: publickey
    ports:
      - name: ssh
        port: 22
        protocol: TCP
        targetPort: 22
      - name: mqtt
        port: 1883
        protocol: TCP
        targetPort: 1883
```

This would create 1 iotgateway VM and 4 iotsensor VMs. Adjustments would also need to be made in [values-secret](https://github.com/validatedpatterns-sandbox/virtualization-starter-kit/blob/main/values-secret.yaml.template) to add the iotgateway-ssh and iotsensor-ssh data structures (if you want them to be different from the default vm-ssh data structures).

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns-sandbox/virtualization-starter-kit/issues)
