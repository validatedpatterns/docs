---
 date: 2023-12-20
 title: Private Repositories
 summary: Initial support for private repositories
 author: Michele Baldessari
 blog_tags:
 - patterns
 - announce
 aliases: /2023/12/20/private-repositories/
---

We're excited to announce that support for private repositories is now
available. This feature is accessible when using VP operator version 0.0.36 or
higher, in conjunction with the latest common/ clustergroup 0.8.2 chart. With
this update, you can deploy patterns from git repositories that are either
password-protected or secured with an SSH key.

To enable this feature, follow these steps:

1. Create a Secret for Repository Access: Generate a secret that holds the
   credentials for accessing your repository. This secret should be formatted
   according to ArgoCD's guidelines, which you can find [here](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories).
   For instance, your secret might look like this:
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
2. Deploy the Pattern with the Secret: Point your pattern's Custom Resource to
   the secret you created in the first step. Ensure that both tokenSecret and
   tokenSecretNamespace fields are correctly set to reference your new secret.
   Here's an example of how this might be configured:
   ```yaml
   apiVersion: gitops.hybrid-cloud-patterns.io/v1alpha1
   kind: Pattern
   metadata:
     name: pattern-sample
     namespace: openshift-operators
   spec:
     clusterGroupName: hub
     gitSpec:
       targetRepo: git@github.com:mbaldessari/mcg-private.git
       targetRevision: private-repo
       tokenSecret: private-repo
       tokenSecretNamespace: openshift-operators
   ```

Following these steps ensures that the pattern's framework efficiently manages
the necessary configurations, allowing all Argo instances to access the private
repository.

To do this entirely via CLI you can simply run the following:
```bash
./pattern.sh make TOKEN_SECRET=private-repo TOKEN_NAMESPACE=openshift-operators install
```

The above command assumes that the `private-repo` secret exists and that the
`origin` remote of the repository points to
`git@github.com:mbaldessari/mcg-private.git` as specified in the secret above.
