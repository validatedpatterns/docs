---
title: Customize GPU provisioning nodes
weight: 20
aliases: /rag-llm-gitops/gpuprovisioning/
---
# Customizing GPU provisioning nodes

By default, GPU nodes use the instance type `g5.2xlarge`. If you need to change the instance type—such as to address performance requirements, carry out these steps: 

1. In your local branch of the `rag-llm-gitops` git repository change to the `ansible/playbooks/templates` directory. 

2. Edit the file `gpu-machine-sets.j2` changing the `instanceType` to for example `g5.4xlarge`. Save and exit. 

3. Push the changes to the origin remote repository by running the following command: 

   ```sh
   $ git push origin my-test-branch
   ```
