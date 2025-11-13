---
 date: 2024-08-30
 title: Pushing secrets
 summary: Pushing Secrets to Vault
 author: Michele Baldessari
 blog_tags:
 - patterns
 keywords:
 - hashicorp vault
 - kubernetes secrets
 - secret management
 - external secrets
 - pushsecret
 - validated patterns
 - gitops
---

# Pushing Secrets to HashiCorp Vault

With this post we'd like to Introduce a powerful new feature: Push Secrets Across Nodes and Namespaces.

## Overview

We’re excited to announce a new feature that enhances the flexibility and
security of your secret management workflows: you can now use the
`secret/pushsecrets` vault path to push secrets from any node or any namespace
to Vault. This feature allows secrets to be securely retrieved from a different
namespace or even a different cluster node, making it easier to manage and
distribute sensitive data across your infrastructure.

Once stored in the Vault, these secrets can be accessed from either a different
namespace or a different cluster node, providing a seamless way to manage
secrets across a distributed environment.

## How It Works

To illustrate how this feature works, let’s walk through a simple example where
we push an existing kubernetes secret called `existing-secret` into the Vault
using a PushSecret resource. The existing secret could be the following:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: existing-secret
  namespace: hello-world
data:
  bar: YmFyCg== # The secret field we are interested in pushing into the vault
  foo: ....
```

And here is the `PushSecret` resource that will fetch the `bar` key from the existing
secret above and push it into the vault.
```yaml
apiVersion: external-secrets.io/v1alpha1
kind: PushSecret
metadata:
  name: pushsecret
  namespace: hello-world
spec:
  data:
    - conversionStrategy: None
      match:
        remoteRef:
          remoteKey: pushsecrets/testme # the remote vault path
          property: baz # the key in the path defined above inside the vault
        secretKey: bar # The property of the local `existing-secret` secret that will be pushed to `pushsecrets/testme/baz` in the vault
  deletionPolicy: Delete
  refreshInterval: 10s
  secretStoreRefs:
    - kind: ClusterSecretStore
      name: vault-backend
  selector:
    secret:
      name: existing-secret
  updatePolicy: Replace
```

In this example, the PushSecret resource is defined in the hello-world
namespace and it will take the key `bar` of the k8s secret called
`existing-secret` and push it to Vault in the `pushsecrets/testme` path and
ultimately it will be copied under the `baz` key/property inside vault.

Here is some more info on the other yaml fields:

* `deletionPolicy` Determines what happens to the secret when the PushSecret is deleted. In this case, the secret will also be deleted from the Vault.
* `refreshInterval` Sets how often the secret will be refreshed. This is set to 10 seconds in the example, meaning the secret will be checked and updated every 10 seconds.
* `secretStoreRefs` Points to the ClusterSecretStore named vault-backend, which defines where the secret will be stored.
* `selector` Identifies the secret to be pushed. In this case, it is the secret named existing-secret within the hello-world namespace.
* `updatePolicy` Specifies the policy for updating the secret in the Vault. The Replace policy will overwrite any existing secret at the target location with the new value.

This configuration effectively takes a specific property (baz) from an existing
secret in the hello-world namespace and pushes it to the Vault path
secret/pushsecrets/testme. The secret can then be retrieved from any other
namespace or node that has access to the Vault.
