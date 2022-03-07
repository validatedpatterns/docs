---
layout: default
title: Workflow
nav_order: 4
---

# Workflow

These patterns are designed to be composed of multiple components, and for those components to be used in gitops
workflows by consumers and contributors.  To use the first pattern as an example, we maintain the [Industrial Edge](industrial-edge) pattern, which uses a [repo](https://github.com/hybrid-cloud-patterns/industrial-edge) with pattern-specific logic and configuration as well as a [common repo](https://github.com/hybrid-cloud-patterns/common) which has elements common to multiple patterns.  The common repo is included in each pattern repo as a subtree.

## Consuming a pattern 

1. Fork the pattern repo on GitHub to your workspace (GitHub user or organization). It is necessary to fork because your fork will be updated as part of the GitOps and DevOps processes, and the main branch (by default) will be used in the automated workflows.

1. Clone the forked copy

   `git clone git@github.com:<your-workspace>/industrial-edge.git`

1. Create a local copy of the Helm values file that can safely include credentials

  DO NOT COMMIT THIS FILE
  You do not want to push personal credentials to GitHub.

   ```sh
   cp values-secret.yaml.template ~/values-secret.yaml
   vi ~/values-secret.yaml
   ```

1. Customize the deployment for your cluster

   ```sh
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

   ```sh
   git remote add hcp https://github.com/hybrid-cloud-patterns/industrial-edge
   git fetch --all
   git branch -b hcp-main -t hcp/main
   <make changes on the hcp-main branch>
   git push origin hcp-main
   ```

To update branch `hcp-main` with upstream changes:

   ```sh
   git checkout hcp-main
   git pull --rebase 
   ```

To reflect these changes in your forked repo (such as if you would like to submit a PR later):

   ```sh
   git push origin hcp-main
   ```

If you want to integrate upstream pattern changes into your local GitOps process:

   ```sh
   git checkout main
   git merge hcp-main
   git push origin main
   ```

Using this workflow, the `hcp-main` branch will:

1. Be isolated from any changes that are being made by your local GitOps processes
1. Be merge-able (or cherry-pick-able) into your local main branch to be used by your local GitOps processes 
(this is especially useful for tracking when any submodules, like common, update)
1. Be a good basis for submitting Pull Requests to be integrated upstream, since it will not contain your local configuration differences or your local GitOps commits

## Changing subtrees

Our patterns use the git subtree feature as a mechanism to promote modularity, so that multiple patterns can use the
same common basis.  Over time we will move more functionality into common, to isolate the components that are 
particular to each pattern, and standard usage conventions emerge.  This will make the tools in common more powerful and featureful, and make it easier to develop new patterns.  Normally, we will maintain the common subtree in the normal course of updates, and pulling changes from upstream will include any changes from common.

You only need to change subtrees if you want to test changes in the common/ area of the pattern repositories, or if you wish to contribute to the common/ repo itself in conjunction with one of the patterns. Using the pattern by itself _does not_ require changing subtrees.

For the common cases (use and consumption of the pattern), users do not need to be aware that the pattern uses a subtree at all.

   ```sh
   git clone https://github.com/<your-workspace>/industrial-edge
   ```

If you want to change and track your own version of common, you should fork and clone our common repo separately:

   ```sh
   git clone https://github.com/<your-workspace>/common
   ```

Now, you can make changes in your fork's main branch, or else make a new branch and make changes there.

If you want to track these changes in your fork of the *pattern* repository (industrial-edge in this case), you will need to swap out the subtree in industrial-edge for the version of common you forked.  We have provided a script to make this a bit easier:

   ```sh
   common/scripts/make_common_subtree.sh <subtree_repo> <subtree_branch> <subtree_remote_name>
   ```

This script will set up a new remote in your local working directory with the repository you specify. It will replace the common directory with a new common from the fork and branch you specify, and commit it.  The script will *not* push the result.

For example:

   ```sh
   common/scripts/make_common_subtree.sh https://github.com/mhjacks/common.git wip-main common-subtree
   ```

This will replace common in the current repository with the wip-main branch from the common in mhjacks's common repo, and call the remote common-subtree.

From that point, changes from mhjacks's wip-main branch on mhjacks's fork of common can be pulled in this way:

   ```sh
   git subtree pull --prefix common common-subtree wip-main
   ```

When run without arguments, the script will run as if it had been given the following arguments:

   ```sh
   common/scripts/make_common_subtree.sh https://github.com/hybrid-cloud-patterns/common.git main common-subtree
   ```

Which are the defaults the repository is normally configured with.

## Subtree vs. Submodule

It has always been important to us to be have a substrate for patterns that is as easy as possible to share amongst
multiple patterns. While it is possible to share changes between multiple unrelated git repositories, it is an almost
entirely manual process, prone to error. We feel it is important to be able to provide a "pull" experience (i.e. one git "pull" type action) to update the shared components of a pattern. Two strategies exist for repo sharing in this way: submodule and subtree. We started with submodules but have since moved to subtree.

Atlassian has some good documentation on what subtree is [here](https://blog.developer.atlassian.com/the-power-of-git-subtree/) and [here](https://www.atlassian.com/git/tutorials/git-subtree). In short, a subtree integrates another repository's history into a parent repository, which allows for most of the benefits of a submodule workflow, without most of the caveats.

Earlier versions of this document described the usage of patterns with submodules instead of subtrees. In the earliest stages of pattern development, we used submodules because the developers of the project were familiar with submodules and had used them previously, but we had not used subtrees. User feedback, as well as some of the unavoidable complexities of submodules, convinced us to try subtrees and we believe we will stick with that strategy. Some of the unavoidable complexities of submodules include:

- Having to remember to checkout repositories with `--recurse-submdules`, or else doing `git submodule init && git submodule sync`. Experienced developers asked in several of our support channels early on why common was empty.
- Hoping that other tools that are interacting with the repository are compatible with the submodule approach. (To be fair, tools like ArgoCD and Tekton Pipelines did this very well; their support of submodules was one of the key reasons we started with submodules)
- When changing branches on a submoduled repository, if the branch you were changing to was pointed to a different revision of the submoduled repository, the repo would show out of sync. While this behavior is correct, it can be surprising and difficult to navigate.
- In disconnected environments, submodules require mirroring more repositories.
- Developing with a fork of the submoduled repository means maintaining two forked repos and multiple branches in both.

Subtrees have some pitfalls as well. In the subtree strategy, it is easier to diverge from the upstream version of the subtree repo, and in fact with a typical `git clone`, the user may not be aware that a subtree is in use at all. This can be considered a feature, but could become problematic if the user/consumer later wants to update to a newer version of the subtree but local changes might conflict. Additionally, since subtrees are not as well understood generally, there can be some surprising effects. In practice, we have run into the following:

- Cherry picking from a subtree commit into the parent puts the change in the parent location, not the subtree

## Contributing to Patterns using Common Subtrees

Once you have forked common and changed your subtree for testing, changes from your fork can then be proposed to https://github.com/hybrid-cloud-patterns/common.git and can then be integrated into other patterns. A change to upstream common for a particular upstream pattern would have to be done in two stages:

1. PR the change into upstream's common
1. PR the updated common into the pattern repository
