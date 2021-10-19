---
layout: default
title: Workflow
nav_order: 3
---

# Workflow

These patterns are designed to be composed of multiple components, and for those components to be used in gitops
workflows by consumers and contributors.  To use the first pattern as an example, we maintain the [Industrial Edge](industrial-edge) pattern, which uses a [repo](https://github.com/hybrid-cloud-patterns/industrial-edge) with pattern-specific logic and configuration as well as a [common repo](https://github.com/hybrid-cloud-patterns/common) which has elements common to multiple patterns.  The common repo is included in each pattern repo as a submodule.  This allows
consumers of the pattern flexibility to in both repos, or neither, as it suits their needs.

## Consuming a pattern 

1. Fork the pattern repo on GitHub to your workspace (GitHub user or organization). It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes, and the main branch (by default) will be used in the automated workflows.

1. Clone the forked copy

   `git clone --recurse-submodules git@github.com:<your-workspace>/industrial-edge.git`

1. Create a local copy of the Helm values file that can safely include credentials

  DO NOT COMMIT THIS FILE
  You do not want to push personal credentials to GitHub.
   ```
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```

1. Customize the deployment for your cluster

   ```
   vi values-global.yaml
   git commit values-global.yaml
   git push
   ```

## Contributing

For contributions, we recommend adding the upstream repository as an additional remote, and making changes on a
branch other than main.  Changes on this branch can then be merged to the `main` branch (to be reflected in the GitOps
workflows) and will be easier to make upstream, if you wish.  Contributions from your forked `main` branch will contain, by design:

1. Customizations to `values-global.yaml` and other files that are particular to your installation
1. Commits made by Tekton and other automated processes that will be particular to your installation

To isolate changes for upstreaming (`hcp` is "Hybrid Cloud Patterns", you can use a different remote and/or branch name
if you want):

   ```
   git remote add hcp https://github.com/hybrid-cloud-patterns/industrial-edge
   git fetch --all
   git branch -b hcp-main -t hcp/main
   <make changes on the hcp-main branch>
   git push origin hcp-main
   ```

To update branch `hcp-main` with upstream changes:
   ```
   git checkout hcp-main
   git pull --rebase 
   ```

To reflect these changes in your forked repo (such as if you would like to submit a PR later):
   ```
   git push origin hcp-main
   ```

If you want to integrate upstream pattern changes into your local GitOps process:
   ```
   git checkout main
   git merge hcp-main
   git push origin main
   ```

Using this workflow, the `hcp-main` branch will:

1. Be isolated from any changes that are being made by your local GitOps processes
1. Be merge-able (or cherry-pick-able) into your local main branch to be used by your local GitOps processes 
(this is especially useful for tracking when any submodules, like common, update)
1. Be a good basis for submitting Pull Requests to be integrated upstream, since it will not contain your local configuration differences or your local GitOps commits

## Working with submodules

Our patterns use the git submodules feature as a mechanism to promote modularity, so that multiple patterns can use the
same common basis.  Over time we will move more functionality into common, to isolate the components that are 
particular to each pattern, and standard usage conventions emerge.  This will make the tools in common more powerful and featureful, and make it easier to develop new patterns.

The most straightforward use of submodules is to track the version that the upstream repository is using.  This can be
done by cloning the repository initially with the `--recurse-submodules` option:
   ```
   git clone --recurse-submodules https://github.com/<your-workspace>/industrial-edge
   ```

If you want to track a different fork of a submodule (and push use it in your GitOps environment):
   ```
   git submodule set-url common https://github.com/<your-workspace>/common
   git commit -m "Changing URL for common submodule"
   git push origin main
   ```

If you want to track a different branch of the forked submodule (other than the default, `main`):
   ```
   git submodule set-branch --branch <target-branch> common
   git commit -m "Changing branch to <target-branch> for common submodule"
   git push origin main
   ```

Since the GitOps workflows do not touch the common/ subdirectory of the patterns, changing the URL and tracking `main`
should be acceptable for tracking upstream and proposing changes.
