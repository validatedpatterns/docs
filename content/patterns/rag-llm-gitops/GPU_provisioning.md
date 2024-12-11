---
title: Customize GPU provisioning nodes
weight: 20
aliases: /rag-llm-gitops/gpuprovisioning/
---
# Customizing GPU provisioning nodes

By default the GPU nodes deployed are of instance type `g5.2xlarge`. If for some reason you want to change this maybe due to performance issues carry out the following steps: 

1. In your local branch of the `rag-llm-gitops` git repository change to the `ansible/playbooks/templates` directory. 

2. Edit the file `gpu-machine-sets.j2` changing the `instanceType` to for example `g5.4xlarge`. Save and exit. 

3. Push the changes to the origin remote repository by running the following command: 

   ```sh
   $ git push origin my-test-branch
   ```
