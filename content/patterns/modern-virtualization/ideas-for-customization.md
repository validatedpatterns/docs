---
title: Ideas for Customization
weight: 60
aliases: /ansible-edge-gitops/ideas-for-customization/
---

# Ideas for Customization

# Why change it?

One of the major goals of the Red Hat patterns development process is to create modular, customizable demos. Maybe you are not interested in Ignition as an application, or you do not have kiosks...but you do have other use cases that involve running containers on edge devices. Maybe you want to experiment with different releases of RHEL, or you want to do something different with Ansible Automation Platform.

This demo in particular can be customized in a number of ways that might be very interesting - and here are some starter ideas with some instructions on exactly what and where changes would need to be made in the pattern to accommodate those changes.

# HOWTO define your own VM sets using the chart

1. Either fork the repo or copy the edge-gitops-vms chart out of it.

1. Customize the [values.yaml](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/values.yaml) file

The `vms` data structure is designed to support multiple groups and types of VMs. The `kiosk` example defines all of the variables currently supported by the chart, including references to the Vault instance and port definitions.  If, for example, you wanted to replace kiosk with new iotsensor and iotgateway types, the whole file might look like this:

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

This would create 1 iotgateway VM and 4 iotsensor VMs. Adjustments would also need to be made in [values-secret](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/values-secret.yaml.template) and [ansible-load-controller](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/scripts/ansible_load_controller.sh) to add the iotgateway-ssh and iotsensor-ssh data structures.

# HOWTO define your own VM sets "from scratch"

1. Pick a default template from the standard OpenShift Virtualization template library in the `openshift` namespace. For this pattern, we used `rhel8-desktop-medium`:

```text
$ oc get template -n openshift rhel8-desktop-medium
NAME                   DESCRIPTION                                                                        PARAMETERS        OBJECTS
rhel8-desktop-medium   Template for Red Hat Enterprise Linux 8 VM or newer. A PVC with the RHEL disk...   4 (2 generated)   1
```

1. It might help to create a VM through the command line template process, and see what objects OpenShift Virtualization creates to bring that VM up:

To see the actual JSON that the template converts into:

```text
$ oc process -n openshift rhel8-desktop-medium
{
    "kind": "List",
    "apiVersion": "v1",
    "metadata": {},
    "items": [
        {
            "apiVersion": "kubevirt.io/v1",
            "kind": "VirtualMachine",
            "metadata": {
                "annotations": {
                    "vm.kubevirt.io/validations": "[\n  {\n    \"name\": \"minimal-required-memory\",\n    \"path\": \"jsonpath::.spec.domain.resources.requests.memory\",\n    \"rule\": \"integer\",\n    \"message\": \"This VM requires more memory.\",\n    \"min\": 1610612736\n  }\n]\n"
                },
                "labels": {
                    "app": "rhel8-yywa22lijw8hl017",
                    "vm.kubevirt.io/template": "rhel8-desktop-medium",
                    "vm.kubevirt.io/template.revision": "1",
                    "vm.kubevirt.io/template.version": "v0.19.5"
                },
                "name": "rhel8-yywa22lijw8hl017"
            },
            "spec": {
                "dataVolumeTemplates": [
                    {
                        "apiVersion": "cdi.kubevirt.io/v1beta1",
                        "kind": "DataVolume",
                        "metadata": {
                            "name": "rhel8-yywa22lijw8hl017"
                        },
                        "spec": {
                            "sourceRef": {
                                "kind": "DataSource",
                                "name": "rhel8",
                                "namespace": "openshift-virtualization-os-images"
                            },
                            "storage": {
                                "resources": {
                                    "requests": {
                                        "storage": "30Gi"
                                    }
                                }
                            }
                        }
                    }
                ],
                "running": false,
                "template": {
                    "metadata": {
                        "annotations": {
                            "vm.kubevirt.io/flavor": "medium",
                            "vm.kubevirt.io/os": "rhel8",
                            "vm.kubevirt.io/workload": "desktop"
                        },
                        "labels": {
                            "kubevirt.io/domain": "rhel8-yywa22lijw8hl017",
                            "kubevirt.io/size": "medium"
                        }
                    },
                    "spec": {
                        "domain": {
                            "cpu": {
                                "cores": 1,
                                "sockets": 1,
                                "threads": 1
                            },
                            "devices": {
                                "disks": [
                                    {
                                        "disk": {
                                            "bus": "virtio"
                                        },
                                        "name": "rhel8-yywa22lijw8hl017"
                                    },
                                    {
                                        "disk": {
                                            "bus": "virtio"
                                        },
                                        "name": "cloudinitdisk"
                                    }
                                ],
                                "inputs": [
                                    {
                                        "bus": "virtio",
                                        "name": "tablet",
                                        "type": "tablet"
                                    }
                                ],
                                "interfaces": [
                                    {
                                        "masquerade": {},
                                        "name": "default"
                                    }
                                ],
                                "networkInterfaceMultiqueue": true,
                                "rng": {}
                            },
                            "machine": {
                                "type": "pc-q35-rhel8.4.0"
                            },
                            "resources": {
                                "requests": {
                                    "memory": "4Gi"
                                }
                            }
                        },
                        "evictionStrategy": "LiveMigrate",
                        "networks": [
                            {
                                "name": "default",
                                "pod": {}
                            }
                        ],
                        "terminationGracePeriodSeconds": 180,
                        "volumes": [
                            {
                                "dataVolume": {
                                    "name": "rhel8-yywa22lijw8hl017"
                                },
                                "name": "rhel8-yywa22lijw8hl017"
                            },
                            {
                                "cloudInitNoCloud": {
                                    "userData": "#cloud-config\nuser: cloud-user\npassword: nnpa-12td-e0r7\nchpasswd: { expire: False }"
                                },
                                "name": "cloudinitdisk"
                            }
                        ]
                    }
                }
            }
        }
    ]
}
```

And to use the template to create a VM:

```shell
oc process -n openshift rhel8-desktop-medium | oc apply -f -
virtualmachine.kubevirt.io/rhel8-q63yuvxpjdvy18l7 created
```

In just a few minutes, you will have a blank rhel8 VM running, which you can then login to (via console) and customize.

1. Get the details of this template as a local YAML file:

```shell
oc get template -n openshift rhel8-desktop-medium -o yaml > my-template.yaml
```

Once you have this local template, you can view the elements you want to customize, possibly using [this](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/charts/hub/edge-gitops-vms/templates/virtual-machines.yaml) as an example.

# HOWTO Define your own Ansible Controller Configuration

The [ansible_load_controller.sh](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/scripts/ansible_load_controller.sh) is designed to be relatively easy to customize with a new controller configuration. Structurally, it is principally based on [configure_controller.yml](https://github.com/redhat-cop/controller_configuration/blob/devel/playbooks/configure_controller.yml) from the Red Hat Community of Practice [controller_configuration](https://github.com/redhat-cop/controller_configuration) collection. The order and specific list of  roles invoked is taken from there.

To customize it, the main thing would be to replace the different variables in the role tasks with the your own. The script includes the roles for variable types that this pattern does not manage in order to make that part straightforward. Feel free to add your own roles and playbooks (and add them to the controller configuration script).

The reason this pattern ships with a script as it does instead of invoking the referenced playbook directly is that several of the configuration elements depend on each other, and there was not a super-convenient place to put things like the controller credentials as the playbook suggests.

# HOWTO substitute your own container application (instead of ignition)

1. Adjust the query in the [inventory_preplay.yml](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/ansible/inventory_preplay.yml) either by overriding the vars for the play, or forking the repo and replacing the vars with your own query terms. (That is, use your own label(s) and namespace to discover the services you want to connect to.

1. Adjust or override the vars in the [provision_kiosk.yml](https://github.com/validatedpatterns/ansible-edge-gitops/blob/main/ansible/provision_kiosk.yml) playbook to suitable values for your own container application. The roles it calls are fairly generic, so changing the vars is all you should need to do.

# Next Steps

## [Help & Feedback](https://groups.google.com/g/validatedpatterns)
## [Report Bugs](https://github.com/validatedpatterns/ansible-edge-gitops/issues)
