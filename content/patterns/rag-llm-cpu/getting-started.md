---
title: Getting Started
weight: 10
aliases: /rag-llm-cpu/getting-started/
---

## Prerequisites

- Podman is installed on your system.
- You are logged into an OpenShift 4 cluster with administrative permissions.

## Deployment instructions

1. Fork the [rag-llm-cpu](https://github.com/validatedpatterns-sandbox/rag-llm-cpu) git repository.

2. Clone the forked repository by running the following command:

   ```sh
   $ git clone git@github.com:your-username/rag-llm-cpu.git
   ```

3. Go to your repository: Ensure you are in the root directory of your git repository by using the following command:

   ```sh
   $ cd rag-llm-cpu
   ```

4. Create a local copy of the secret values file by running the following command:

   ```sh
   $ cp values-secret.yaml.template ~/values-secret-rag-llm-cpu.yaml
   ```

5. Create an API token on [HuggingFace](https://huggingface.co/)

6. Update the secret values file:

   ```sh
   vim ~/values-secret-rag-llm-cpu.yaml
   ```

   At the very least, you must update the value of the `token` field in the `huggingface` section with the API token from the previous steps. By default, this pattern deploys Microsoft SQL Server as one of the RAG DB providers so it is good to update the `sapassword` field in the `mssql` section as well. If you plan to use other DB providers, feel free to update their secrets now as well.

7. If you plan to just install the pattern as-is, you can install it already without making any changes:

   ```sh
   $ ./pattern.sh oc whoami --show-console
   ```

   This should output the cluster you want to install the pattern on. If it does not, log in to your OpenShift cluster before running the following install command:

   ```sh
   $ ./pattern.sh make install
   ```

   Everything gets deployed after running the install command. If you want to check the status of all the components after the install completes, you can run:

   ```sh
   $ ./pattern.sh make argo-healthcheck
   ```

8. If you want to make changes to the pattern before installing it (using different RAG DB providers, changing the model deployed to the LLM, updating the sources for the RAG DBs, and so on), follow the instructions on the [Configuring this Pattern](/rag-llm-cpu/configure/) page.

## Verification

1. Check that all applications are successfully installed:

   ```sh
   $ ./pattern.sh make argo-healthcheck
   ```

   It might take several minutes after the pattern is installed for all the applications to become synced and healthy as downloading the LLM models and populating the RAG DBs might take several minutes to complete.

   ![Healthcheck](/images/rag-llm-cpu/healthcheck.png)

2. Open the RAG LLM Demo UI by clicking the link in the 9-dots menu.

   ![9Dots](/images/rag-llm-cpu/9dots.png)

3. Verify the LLMs and RAG DB providers you configured are available in the configuration and that making a query in the chatbot triggers a response from the RAG DB and LLM you selected.
   > **Note**: it might take a minute or so for the CPU-based LLM to start streaming a response, especially the first time you make a query after installing the pattern as everything is loaded into memory.

   ![App](/images/rag-llm-cpu/app.png)

## Next steps

Once the pattern is up-and-running, you might want to customize the pattern (e.g., change the LLM, add new RAG sources, or switch vector databases). For more details on how you can tweak it to your use case, see [Configuring this pattern](/rag-llm-cpu/configure/).
