---
 date: 2023-12-20
 title: Private Repositories
 summary: Initial support for private repositories
 author: Michele Baldessari
 blog_tags:
 - patterns
 - announce
 aliases: /2023/12/20/private-repositories/
 keywords:
 - private git repositories
 - ssh authentication
 - argocd
 - validated patterns
 - git security
 - repository access
---

We're excited to announce that support for private repositories is now available. This feature requires VP operator version 0.0.36 or higher with the latest common/ clustergroup 0.8.2 chart. With this update, you can deploy patterns from git repositories that are either password-protected or secured with an SSH key.

## Setting up a private repository with SSH

To deploy a pattern from a private repository, follow these steps:

### Create a secret for repository access

Generate a secret containing the credentials for accessing your repository. This secret should be formatted according to [ArgoCD's declarative setup guidelines](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories). For example:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-repo
  namespace: openshift-operators
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: git@github.com:mbaldessari/mcg-private.git
  sshPrivateKey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    a3...
    ...
    ...
    -----END OPENSSH PRIVATE KEY-----
```

### Deploy the pattern with the secret

Point your pattern's Custom Resource to the secret you created. Ensure that the `tokenSecret` and `tokenSecretNamespace` fields reference your new secret:

```yaml
apiVersion: gitops.hybrid-cloud-patterns.io/v1alpha1
kind: Pattern
metadata:
  name: pattern-sample
  namespace: patterns-operator
spec:
  clusterGroupName: hub
  gitSpec:
    targetRepo: git@github.com:mbaldessari/mcg-private.git
    targetRevision: private-repo
    tokenSecret: private-repo
    tokenSecretNamespace: openshift-operators
```

This ensures that the pattern framework manages the necessary configurations, allowing all Argo instances to access the private repository.

Alternatively, you can do this entirely via the CLI:

```bash
./pattern.sh make TOKEN_SECRET=private-repo TOKEN_NAMESPACE=openshift-operators install
```

This command assumes that the `private-repo` secret exists and that the `origin` remote of the repository points to `git@github.com:mbaldessari/mcg-private.git` as specified in the secret.

## Using a GitLab private repository with a PAT

First, make sure your PAT has at least Read and Download permissions for your private repository.

As with the SSH example above, create a secret before running the install:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: private-repo
  namespace: openshift-operators
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  type: git
  url: https://gitlab.com/dminnear-rh/mcg-private.git
  username: oauth2
  password: glpat-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Note that the username must be `oauth2`, not your GitLab handle.

Then reference the secret in the install:

```bash
./pattern.sh make TOKEN_SECRET=private-repo TOKEN_NAMESPACE=openshift-operators install
```
