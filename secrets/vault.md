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

In order to setup HashiCorp Vault there are a number of different steps. Fist you must *unseal* the vault and then you must create the secrets assets needed. Fortunately the validated patterns effort has automated this for you by providing a script.

From the shell you ran `make install` run:

```sh
make vault-init
```

The `Makefile` includes a call out to the script to do the unseal and setup the secrets.

You can check the secrets were set up by examining the Vault user interface. But in order to do so you will need to get some data from the `common/pattern-vault.init` file generated from the `make vault-init` command.

```text
~/g/multicloud-gitops on main ◦ cat common/pattern-vault.init
Unseal Key 1: jJvLf7Pv+BDo0d39ofvBu58srGpUrhVZbnzXXXXXXXXX
Unseal Key 2: XMQtBDB3WGdBnWFt3jIb8IZ8wyr4RxPM2oB7XXXXXXXX
Unseal Key 3: sStLSI0ejUAt4kno2ArPTN3kzwzqiBmYnhrXXXXXXXXX
Unseal Key 4: VdVkgdtuXKEqF4oNFg8dh2MkzXbs3ZJ68NzRXXXXXXXX
Unseal Key 5: gZ5afnmJu+24Ty+H6EP3gf257D9ZefrgJrYXXXXXXXXX

Initial Root Token: s.R3NG5LHipbabbleDummyhyKHq

Vault initialized with 5 key shares and a key threshold of 3. Please securely
distribute the key shares printed above. When the Vault is re-sealed,
restarted, or stopped, you must supply at least 3 of these keys to unseal it
before it can start servicing requests.

Vault does not store the generated master key. Without at least 3 keys to
reconstruct the master key, Vault will remain permanently sealed!

It is possible to generate new unseal keys, provided you have a quorum of
existing unseal keys shares. See "vault operator rekey" for more information.
```

Copy the `Initial Root Token`. Above it is `s.R3NG5LHipbabbleDummyhyKHq`.

In the OpenShift console under the project `vault` navigate to Networking/Routes and click on the URL for `vault`.

[![Vault Route](/images/secrets/vault-route.png)](/images/secrets/vault-route.png)

On the Vault page paste the copied token from the `pattern-vault-init` file.

[![Vault Sign In](/images/secrets/vault-signin.png)](/images/secrets/vault-signin.png)

After signing in you will see the secrets that have been created.

[![Vault Secrets Engine](/images/secrets/vault-secrets-engine.png)](/images/secrets/vault-secrets-engine.png)

# Unseal

If you don't see the sign in page but instead see an unseal page, something may have happened the cluster and you need to unseal it again. Instead of using `make vault-init` you should run `make vault-unseal`.

# What's next?

Check with the validated pattern instructions to see if there are further steps you need to perform. Sometimes this might be deploying a pattern on an edge cluster and checking to see if the correct Vault handshaking and updating occurs.
