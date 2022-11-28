---
layout: default
parent: Secrets
title: HashiCorp Vault
nav_order: 1
---

# Deploying HashiCorp Vault in a validated pattern

{: .no_toc }

## Table of contents

{: .no_toc .text-delta }

1. TOC
{:toc}

# Prerequisites

You have deployed/installed a validated pattern using the instructions provided for that pattern. This should include setting having logged into the cluster using `oc login` or setting you `KUBECONFIG` environment variable and running a `make install`.

# Setting up HashiCorp Vault

Any validated pattern that uses HashiCorp Vault already has deployed Vault as part of the `make install`.  To verify that Vault is installed you can first see that the `vault` project exists and then select the Workloads/Pods:

[![Vault Pods](/images/secrets/vault-pods.png)](/images/secrets/vault-pods.png)

In order to setup HashiCorp Vault there are two different ways, both of which happen automatically as part of the `make install` command:

1. Inside the cluster directly when the helm value `clusterGroup.insecureUnsealVaultInsideCluster` is set to `true`. With this method a cronjob will run every five minutes inside the `imperative` namespace and unseal, initialize and configure the vault. The vault's unseal keys and root token will be stored inside a secret called `vaultkeys` in the `imperative` namespace. **It is considered best practice** to copy the content of that secret offline, store it securely and then delete it.
2. On the user's computer when the helm value `clusterGroup.insecureUnsealVaultInsideCluster` is set to `false`. This will store the json containing containing both vault root token and unseal keys inside a file called `common/pattern-vault.init`. It is recommended to encrypt this file or store it securely.

An example output is the following:

```json
{
    "recovery_keys_b64": [],
    "recovery_keys_hex": [],
    "recovery_keys_shares": 0,
    "recovery_keys_threshold": 0,
    "root_token": "hvs.VNFq7yPuZljq2VDJTkgAMs2Z",
    "unseal_keys_b64": [
        "+JJjKgZyEB1rbKlXs1aTuC+PBivukIlnpoe7bH4qc7TL",
        "X2ib6LNZw+kOQH1WYR9t3RE2SgB5WbEf2FfD40OybNXf",
        "A4DIhv9atLIQsqqyDAYkmfEJPYhFVuKGSGYwV7WCtGcL",
        "ZWkQ7+qtgmClKdlNKWcdpvyxArm07P9eArHZB4/CMZWn",
        "HXakF073+Kk7oOpAFbGlKIWYApzUhC/F1LDfowF/M1LK"
    ],
    "unseal_keys_hex": [
        "f892632a0672101d6b6ca957b35693b82f8f062bee908967a687bb6c7e2a73b4cb",
        "5f689be8b359c3e90e407d56611f6ddd11364a007959b11fd857c3e343b26cd5df",
        "0380c886ff5ab4b210b2aab20c062499f1093d884556e28648663057b582b4670b",
        "656910efeaad8260a529d94d29671da6fcb102b9b4ecff5e02b1d9078fc23195a7",
        "1d76a4174ef7f8a93ba0ea4015b1a5288598029cd4842fc5d4b0dfa3017f3352ca"
    ],
    "unseal_shares": 5,
    "unseal_threshold": 3
}
```

The vault's root token is needed to log into the vault's UI and the unseal keys are needed whenever the vault pods are restarted.
In the OpenShift console click on the nine box at the top and click on the `vault` line:
[![Vault Nine Box](/images/secrets/vault-nine-box.png)]

Copy the `root_token` field which in the example above has the value `hvs.VNFq7yPuZljq2VDJTkgAMs2Z` and paste it in the sign-in page:

[![Vault Sign In](/images/secrets/vault-signin.png)](/images/secrets/vault-signin.png)

After signing in you will see the secrets that have been created.

[![Vault Secrets Engine](/images/secrets/vault-secrets-engine-screen.png)](/images/secrets/vault-secrets-engine-screen.png)

# Unseal

If you don't see the sign in page but instead see an unseal page, something may have happened the cluster and you need to unseal it again. Instead of using `make vault-init` you should run `make vault-unseal`. You can also unseal it manually by running `vault operator unseal` inside the `vault-0` pod in the `vault` namespace.

# What's next?

Check with the validated pattern instructions to see if there are further steps you need to perform. Sometimes this might be deploying a pattern on an edge cluster and checking to see if the correct Vault handshaking and updating occurs.
